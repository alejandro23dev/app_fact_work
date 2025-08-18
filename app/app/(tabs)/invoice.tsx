import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Switch,
  KeyboardAvoidingView,
} from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';
import DateTimePicker from '@react-native-community/datetimepicker';

type ExpenseItem = {
  id: string;
  description: string;
  amount: number;
};

export default function Invoice() {
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState(new Date());
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: ''
  });
  const [noExpenses, setNoExpenses] = useState(false);
  const [taxRate, setTaxRate] = useState('10');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceName, setInvoiceName] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    generateInvoiceNumber();
  }, []);

  const generateInvoiceNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setInvoiceNumber(`INV-${randomNum}`);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const selectContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se necesita acceso a los contactos');
        return;
      }

      const contact = await Contacts.presentContactPickerAsync();
      if (contact) {
        const selectedName = contact.name ||
          [contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
          'Contacto sin nombre';
        setClientName(selectedName.trim());
      }
    } catch (error) {
      console.error('Error seleccionando contacto:', error);
      Alert.alert('Error', 'No se pudo seleccionar el contacto');
    }
  };

  const addExpense = () => {
    if (!newExpense.description.trim()) {
      Alert.alert('Error', 'La descripción del gasto es requerida');
      return;
    }

    const amount = parseFloat(newExpense.amount) || 0;
    if (amount <= 0) {
      Alert.alert('Error', 'El monto debe ser mayor que 0');
      return;
    }

    setExpenses([...expenses, {
      id: generateId(),
      description: newExpense.description.trim(),
      amount
    }]);

    setNewExpense({ description: '', amount: '' });
    setNoExpenses(false);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const calculateSubtotal = () => {
    if (noExpenses) return 0;
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const rate = parseFloat(taxRate) || 0;
    return subtotal * (rate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const saveInvoice = async () => {
    if (!invoiceName.trim()) {
      Alert.alert('Error', 'El nombre del cliente es requerido');
      return;
    }

    if (!clientName.trim()) {
      Alert.alert('Error', 'El nombre del cliente es requerido');
      return;
    }

    if (!noExpenses && expenses.length === 0) {
      Alert.alert('Error', 'Debe agregar gastos o marcar "No hay gastos"');
      return;
    }

    try {
      const invoiceData = {
        clientName,
        invoiceName,
        invoiceNumber,
        date: date.toISOString(),
        expenses: noExpenses ? [] : expenses,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        taxRate,
        createdAt: new Date().toISOString()
      };

      const existingInvoices = await AsyncStorage.getItem('invoices');
      let invoices = existingInvoices ? JSON.parse(existingInvoices) : [];
      invoices.push(invoiceData);
      await AsyncStorage.setItem('invoices', JSON.stringify(invoices));

      Alert.alert('Éxito', 'Factura guardada correctamente');
      resetForm();
    } catch (error) {
      console.error('Error al guardar la factura:', error);
      Alert.alert('Error', 'No se pudo guardar la factura');
    }
  };

  const resetForm = () => {
    setClientName('');
    setExpenses([]);
    setNewExpense({ description: '', amount: '' });
    setNoExpenses(false);
    setTaxRate('10');
    generateInvoiceNumber();
    setDate(new Date());
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Información de Factura */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Factura</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Número:</Text>
            <Text style={styles.infoValue}>{invoiceNumber}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de Factura</Text>
            <View style={styles.clientInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={invoiceName}
                onChangeText={setInvoiceName}
                placeholder="Nombre de la factura"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cliente</Text>
            <View style={styles.clientInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={clientName}
                onChangeText={setClientName}
                placeholder="Nombre del cliente"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.contactButton}
                onPress={selectContact}
              >
                <Ionicons name="person-add-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(prev => !prev)}
            >
              <Text style={styles.dateText}>
                {date.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                style={styles.datePicker}
              />
            )}
          </View>
        </View>

        {/* Gastos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gastos</Text>
            <View style={styles.noExpensesSwitch}>
              <Text style={styles.switchLabel}>No hay gastos</Text>
              <Switch
                value={noExpenses}
                onValueChange={(value) => {
                  setNoExpenses(value);
                  if (value) setExpenses([]);
                }}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={noExpenses ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          </View>

          {!noExpenses && (
            <>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <Text style={styles.label}>Descripción</Text>
                  <TextInput
                    style={styles.input}
                    value={newExpense.description}
                    onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
                    placeholder="Descripción del gasto"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Valor</Text>
                  <TextInput
                    style={styles.input}
                    value={newExpense.amount}
                    onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#999"
                  />
                </View>
                <TouchableOpacity style={styles.addButton} onPress={addExpense}>
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {expenses.length > 0 && (
                <View style={styles.itemsList}>
                  {expenses.map((expense) => (
                    <View key={expense.id} style={styles.itemRow}>
                      <Text style={[styles.itemCell, { flex: 2 }]}>{expense.description}</Text>
                      <Text style={styles.itemCell}>${expense.amount.toFixed(2)}</Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => removeExpense(expense.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#ff3b30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Impuestos y Total */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Totales</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tasa de Impuesto (%)</Text>
            <TextInput
              style={styles.input}
              value={taxRate}
              onChangeText={setTaxRate}
              keyboardType="numeric"
              placeholder="16"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${calculateSubtotal().toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Impuesto ({taxRate}%):</Text>
            <Text style={styles.totalValue}>${calculateTax().toFixed(2)}</Text>
          </View>

          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={[styles.totalLabel, { fontSize: 18 }]}>Total a cobrar:</Text>
            <Text style={[styles.totalValue, { fontSize: 18 }]}>${calculateTotal().toFixed(2)}</Text>
          </View>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.saveButton, (!invoiceName || !clientName || (!noExpenses && expenses.length === 0)) && styles.disabledButton]}
          onPress={saveInvoice}
          disabled={!clientName || (!noExpenses && expenses.length === 0)}
        >
          <Text style={styles.saveButtonText}>Guardar Factura</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    color: '#999',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  itemsList: {
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  itemCell: {
    flex: 1,
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  grandTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#AEAEB2',
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clientInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactButton: {
    backgroundColor: '#4a6cff',
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  dateText: {
    fontSize: 16,
  },
  datePicker: {
    backgroundColor: 'background',
    borderRadius: 10,
  },
  noExpensesSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});