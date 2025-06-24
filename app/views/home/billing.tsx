import React, { useState, useEffect } from 'react';
import {
	SafeAreaView, StyleSheet, Text, View, TextInput,
	TouchableOpacity, ScrollView, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

type ExpenseItem = {
	name: string;
	amount: number;
};

const BillingScreen: React.FC = () => {
	const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
	const [expenseInput, setExpenseInput] = useState<string>('');
	const [expenseName, setExpenseName] = useState<string>('');
	const [finalPrice, setFinalPrice] = useState<string>('');
	const [invoiceOpen, setInvoiceOpen] = useState<boolean>(false);

	const STORAGE_KEY = 'currentInvoice';

	useEffect(() => {
		const loadInvoice = async () => {
			try {
				const data = await AsyncStorage.getItem(STORAGE_KEY);
				if (data) {
					const parsed = JSON.parse(data);
					if (parsed.status === 1) {
						setExpenses(parsed.expenses || []);
						setFinalPrice(parsed.finalPrice?.toString() || '');
						setInvoiceOpen(true);
					}
				}
			} catch (e) {
				console.error('Error cargando la factura:', e);
			}
		};
		loadInvoice();
	}, []);

	useEffect(() => {
		if (!invoiceOpen) return;

		const saveInvoice = async () => {
			try {
				await AsyncStorage.setItem(
					STORAGE_KEY,
					JSON.stringify({
						status: 1,
						expenses,
						finalPrice
					})
				);
			} catch (e) {
				console.error('Error guardando la factura:', e);
			}
		};

		saveInvoice();
	}, [expenses, finalPrice, invoiceOpen]);

	const addExpense = () => {
		const amount = parseFloat(expenseInput);
		if (!expenseName.trim()) {
			Alert.alert('Nombre requerido', 'Por favor ingresa el nombre del gasto.');
			return;
		}
		if (isNaN(amount) || amount <= 0) {
			Alert.alert('Gasto inválido', 'Introduce un valor válido mayor a 0');
			return;
		}
		const newExpense: ExpenseItem = { name: expenseName.trim(), amount };
		setExpenses(prev => [...prev, newExpense]);
		setExpenseInput('');
		setExpenseName('');
		setInvoiceOpen(true);
	};

	const calculateTotal = () => expenses.reduce((acc, curr) => acc + curr.amount, 0);

	const calculateProfit = () => {
		const totalExpenses = calculateTotal();
		const price = parseFloat(finalPrice);
		if (isNaN(price) || price <= 0) return null;
		const profit = price - totalExpenses;
		const percentage = (profit / totalExpenses) * 100;
		return { profit, percentage };
	};

	const handlePrint = async () => {
		const price = parseFloat(finalPrice);
		if (isNaN(price) || price <= 0) {
			Alert.alert('Precio final requerido', 'Por favor ingresa un precio final válido antes de imprimir.');
			return;
		}

		// Alert.alert('Imprimir Ticket', 'Aquí se implementaría la lógica de impresión.');

		try {
			const newInvoice = {
				expenses,
				finalPrice: price,
				currentInvoice: 0,
				createdAt: new Date().toISOString()
			};

			const existingInvoices = await AsyncStorage.getItem('invoices');
			let invoices = existingInvoices ? JSON.parse(existingInvoices) : [];
			invoices.push(newInvoice);
			await AsyncStorage.setItem('invoices', JSON.stringify(invoices));

			await AsyncStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					status: 0,
					expenses,
					finalPrice
				})
			);

			setExpenses([]);
			setFinalPrice('');
			setInvoiceOpen(false);

			Alert.alert('Factura registrada', 'La factura ha sido cerrada correctamente.');
		} catch (e) {
			console.error('Error al cerrar la factura:', e);
		}
	};

	const profitResult = calculateProfit();

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView contentContainerStyle={styles.container}>
				<Text style={styles.title}>Sistema de Facturación</Text>

				<View style={styles.inputSection}>
					<Text style={styles.label}>Agregar Gasto</Text>
					<TextInput
						style={styles.input}
						placeholder="Nombre del gasto (Ej. Transporte)"
						value={expenseName}
						onChangeText={setExpenseName}
					/>
					<TextInput
						style={styles.input}
						keyboardType="numeric"
						placeholder="Ej. 200.50"
						value={expenseInput}
						onChangeText={setExpenseInput}
					/>
					<TouchableOpacity style={styles.addButton} onPress={addExpense}>
						<Text style={styles.addButtonText}>Añadir Gasto</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.expensesList}>
					{expenses.map((exp, index) => (
						<Text key={index} style={styles.expenseItem}>
							{exp.name}: ${exp.amount.toFixed(2)}
						</Text>
					))}
				</View>

				<View style={styles.inputSection}>
					<Text style={styles.label}>Precio Final</Text>
					<TextInput
						style={styles.input}
						keyboardType="numeric"
						placeholder="Ej. 500.00"
						value={finalPrice}
						onChangeText={setFinalPrice}
					/>
				</View>

				{profitResult && (
					<View style={styles.resultBox}>
						<Text style={styles.resultText}>Total de Gastos: ${calculateTotal().toFixed(2)}</Text>
						<Text style={styles.resultText}>Ganancia/Pérdida: ${profitResult.profit.toFixed(2)}</Text>
						<Text style={[styles.resultText, { color: profitResult.percentage >= 0 ? 'green' : 'red' }]}>
							{profitResult.percentage >= 0 ? 'Ganancia' : 'Pérdida'}: {profitResult.percentage.toFixed(2)}%
						</Text>
					</View>
				)}

				<TouchableOpacity style={styles.printButton} onPress={handlePrint}>
					<Ionicons name="print" size={20} color="white" />
					<Text style={styles.printButtonText}>Imprimir Ticket</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
	},
	container: {
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		color: '#333',
	},
	inputSection: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		marginBottom: 5,
		color: '#555',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 5,
		padding: 10,
		fontSize: 16,
		marginBottom: 10,
	},
	addButton: {
		backgroundColor: '#1877f2',
		padding: 10,
		borderRadius: 5,
		alignItems: 'center',
	},
	addButtonText: {
		color: '#fff',
		fontWeight: 'bold',
	},
	expensesList: {
		marginBottom: 20,
	},
	expenseItem: {
		fontSize: 14,
		color: '#333',
		paddingVertical: 2,
	},
	resultBox: {
		backgroundColor: '#f5f5f5',
		padding: 15,
		borderRadius: 5,
		marginBottom: 20,
	},
	resultText: {
		fontSize: 16,
		marginBottom: 5,
	},
	printButton: {
		backgroundColor: '#28a745',
		padding: 15,
		borderRadius: 5,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
	},
	printButtonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
});

export default BillingScreen;
