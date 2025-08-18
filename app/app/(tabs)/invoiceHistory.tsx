import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

type ExpenseItem = {
  id: string;
  description: string;
  amount: number;
};

type Invoice = {
  clientName: string;
  invoiceName: string;
  invoiceNumber: string;
  date: string;
  expenses: ExpenseItem[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: string;
  createdAt: string;
};

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [])
  );

  const loadInvoices = async () => {
    try {
      const stored = await AsyncStorage.getItem('invoices');
      if (stored) {
        setInvoices(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error cargando facturas:', error);
    }
  };

  const toggleExpand = (invoiceNumber: string) => {
    setExpanded((prev) => (prev === invoiceNumber ? null : invoiceNumber));
  };

  const shareInvoice = async (invoice: Invoice) => {
    try {
      let message = `Factura ${invoice.invoiceNumber}\nCliente: ${invoice.clientName}\nFecha: ${new Date(invoice.date).toLocaleDateString()}\nTotal: $${invoice.total.toFixed(2)}\n\n`;
      if (invoice.expenses.length > 0) {
        message += "Gastos:\n";
        invoice.expenses.forEach((exp) => {
          message += `- ${exp.description}: $${exp.amount.toFixed(2)}\n`;
        });
      }
      await Share.share({ message });
    } catch (error) {
      console.error('Error compartiendo factura:', error);
    }
  };

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{item.invoiceName}</Text>
        <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
      </View>
      <Text style={styles.clientName}>👤 {item.clientName}</Text>
      <Text style={styles.date}>
        📆 {new Date(item.date).toLocaleDateString()}
      </Text>
      <Text style={styles.total}>Total: ${item.total.toFixed(2)}</Text>

      {/* Botones */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => toggleExpand(item.invoiceNumber)}
        >
          <Ionicons
            name={expanded === item.invoiceNumber ? "chevron-up" : "chevron-down"}
            size={18}
            color="white"
          />
          <Text style={styles.buttonText}>
            {expanded === item.invoiceNumber ? "Ocultar gastos" : "Ver gastos"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#34C759" }]}
          onPress={() => shareInvoice(item)}
        >
          <Ionicons name="share-outline" size={18} color="white" />
          <Text style={styles.buttonText}>Compartir</Text>
        </TouchableOpacity>
      </View>

      {/* Gastos */}
      {expanded === item.invoiceNumber && item.expenses.length > 0 && (
        <View style={styles.expenses}>
          {item.expenses.map((exp) => (
            <View key={exp.id} style={styles.expenseRow}>
              <Text style={{ flex: 2, color: "#666" }}>{exp.description}</Text>
              <Text style={{ flex: 1, textAlign: "right", color: "#666" }}>
                ${exp.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={invoices}
        keyExtractor={(item, index) => item.invoiceNumber + index}
        renderItem={renderInvoice}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color:'#999' }}>
            No hay facturas registradas
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "600", color: "#666" },
  invoiceNumber: { fontSize: 14, color: "#666" },
  clientName: {
    paddingBottom: 5,
    color: "#666"
  },
  date: { fontSize: 14, color: "#666" },
  total: { fontSize: 16, fontWeight: "600", marginTop: 4, color: "#666" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: { color: "white", fontSize: 14 },
  expenses: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
});
