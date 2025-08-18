import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackedBarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useFocusEffect } from '@react-navigation/native';

type Expense = { id: string; description: string; amount: number };

type Invoice = {
  clientName: string;
  invoiceNumber: string;
  date: string;
  expenses: Expense[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: string;
  createdAt: string;
};

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    total: 0,
    count: 0,
  });
  const screenWidth = Dimensions.get("window").width;

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [])
  );

  const loadInvoices = async () => {
    try {
      const data = await AsyncStorage.getItem('invoices');
      if (data) {
        const parsed: Invoice[] = JSON.parse(data);
        setInvoices(parsed);

        // Totales globales
        const subtotal = parsed.reduce((sum, inv) => sum + inv.subtotal, 0);
        const tax = parsed.reduce((sum, inv) => sum + inv.tax, 0);
        const total = parsed.reduce((sum, inv) => sum + inv.total, 0);

        setTotals({
          subtotal,
          tax,
          total,
          count: parsed.length,
        });
      }
    } catch (error) {
      console.error('Error cargando facturas:', error);
    }
  };

  // Datos para gráfico
  const stackedData = {
    labels: invoices.map((inv) => inv.invoiceNumber),
    legend: ["Gastos", "Beneficio"],
    data: invoices.map((inv) => [
      inv.expenses.reduce((sum, e) => sum + e.amount, 0), // gastos
      inv.total - inv.expenses.reduce((sum, e) => sum + e.amount, 0), // beneficio
    ]),
    barColors: ["#ff4d4f", "#4caf50"],
  };

  // Agrupado por cliente
  const clientSummary: Record<string, number> = {};
  invoices.forEach((inv) => {
    if (!clientSummary[inv.clientName]) {
      clientSummary[inv.clientName] = 0;
    }
    clientSummary[inv.clientName] += inv.total;
  });

  const clientList = Object.entries(clientSummary).map(([client, total]) => ({
    client,
    total,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Tablero Financiero</Text>

      {/* Resumen */}
      <View style={styles.summaryRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Facturas</Text>
          <Text style={styles.cardValue}>{totals.count}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ingresos</Text>
          <Text style={styles.cardValue}>${totals.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Subtotal</Text>
          <Text style={styles.cardValue}>${totals.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Impuestos</Text>
          <Text style={styles.cardValue}>${totals.tax.toFixed(2)}</Text>
        </View>
      </View>

      {/* Gráfico de gastos vs beneficios */}
      <Text style={styles.sectionTitle}>📈 Gastos vs Beneficios</Text>
      <StackedBarChart
        data={stackedData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#f5f5f5",
          backgroundGradientTo: "#e0e0e0",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 12 },
        }}
        style={{ marginVertical: 8 }}
      />

      {/* Organizador por cliente */}
      <Text style={styles.sectionTitle}>👥 Totales por Cliente</Text>
      {clientList.map((item, idx) => (
        <View key={idx} style={styles.clientRow}>
          <Text style={styles.clientName}>{item.client}</Text>
          <Text style={styles.clientTotal}>${item.total.toFixed(2)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: 'transparent'
  },
  card: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'transparent'
  },
  clientName: {
    fontSize: 16,
  },
  clientTotal: {
    fontSize: 16,
    fontWeight: '500',
  },
});
