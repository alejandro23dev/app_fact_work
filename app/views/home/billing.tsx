import React, { useState, useEffect } from 'react';
import {
	SafeAreaView, StyleSheet, Text, View, TextInput,
	TouchableOpacity, ScrollView, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

type ExpenseItem = {
	id: string;
	name: string;
	amount: number;
};

const BillingScreen: React.FC = () => {
	const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
	const [expenseInput, setExpenseInput] = useState<string>('');
	const [expenseName, setExpenseName] = useState<string>('');
	const [finalPrice, setFinalPrice] = useState<string>('');
	const [invoiceOpen, setInvoiceOpen] = useState<boolean>(false);
	const [invoiceName, setInvoiceName] = useState<string>(''); // Nuevo estado para el nombre de la factura
	const STORAGE_KEY = 'currentInvoice';
	const generateId = () => Math.random().toString(36).substr(2, 9);

	useEffect(() => {
		const loadInvoice = async () => {
			try {
				const data = await AsyncStorage.getItem(STORAGE_KEY);
				if (data) {
					const parsed = JSON.parse(data);
					if (parsed.status === 1) {
						// Asegurarnos que cada gasto tenga un ID
						const loadedExpenses = parsed.expenses?.map((exp: any) => ({
							...exp,
							id: exp.id || generateId()
						})) || [];

						setExpenses(loadedExpenses);
						setFinalPrice(parsed.finalPrice?.toString() || '');
						setInvoiceName(parsed.invoiceName || '');
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
						finalPrice,
						invoiceName // Guardar nombre de factura
					})
				);
			} catch (e) {
				console.error('Error guardando la factura:', e);
			}
		};

		saveInvoice();
	}, [expenses, finalPrice, invoiceOpen, invoiceName]);

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
		const newExpense: ExpenseItem = {
			id: generateId(), // Asignamos un ID único
			name: expenseName.trim(),
			amount
		};
		setExpenses(prev => [...prev, newExpense]);
		setExpenseInput('');
		setExpenseName('');
		setInvoiceOpen(true);
	};

	// Función para eliminar un gasto
	const removeExpense = (id: string) => {
		setExpenses(prev => prev.filter(exp => exp.id !== id));
	};

	// Función para verificar si el botón debe estar deshabilitado
	const isPrintDisabled = () => {
		return (
			!invoiceName.trim() ||
			expenses.length === 0 ||
			!finalPrice ||
			isNaN(parseFloat(finalPrice)) ||
			parseFloat(finalPrice) <= 0
		);
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

	const handleSave = async () => {
		const price = parseFloat(finalPrice);
		if (isNaN(price) || price <= 0) {
			Alert.alert('Precio final requerido', 'Por favor ingresa un precio final válido antes de imprimir.');
			return;
		}

		if (!invoiceName.trim()) {
			Alert.alert('Nombre de factura requerido', 'Por favor ingresa un nombre para identificar esta factura.');
			return;
		}

		try {
			const newInvoice = {
				invoiceName: invoiceName.trim(), // Incluir nombre de factura
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
					finalPrice,
					invoiceName
				})
			);

			setExpenses([]);
			setFinalPrice('');
			setInvoiceName('');
			setInvoiceOpen(false);

			Alert.alert('Factura registrada', `La factura "${invoiceName.trim()}" ha sido cerrada correctamente.`);
		} catch (e) {
			console.error('Error al cerrar la factura:', e);
		}
	};

	const profitResult = calculateProfit();

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView contentContainerStyle={styles.container}>
				<View style={styles.header}>
					<Ionicons name="receipt-outline" size={24} color="#4a6cff" />
					<Text style={styles.title}>Sistema de Facturación</Text>
				</View>

				{/* Sección para el nombre de la factura */}
				<View style={styles.inputSection}>
					<Text style={styles.label}>
						<Ionicons name="pencil-outline" size={16} color="#555" /> Nombre de la Factura
					</Text>
					<TextInput
						style={styles.input}
						value={invoiceName}
						onChangeText={setInvoiceName}
					/>
				</View>

				<View style={styles.inputSection}>
					<Text style={styles.label}>
						<Ionicons name="add-circle-outline" size={16} color="#555" /> Agregar Gasto
					</Text>
					<TextInput
						style={styles.input}
						placeholder="Nombre del gasto"
						value={expenseName}
						onChangeText={setExpenseName}
					/>
					<TextInput
						style={styles.input}
						keyboardType="numeric"
						placeholder="Monto"
						value={expenseInput}
						onChangeText={setExpenseInput}
					/>
					<TouchableOpacity style={styles.addButton} onPress={addExpense}>
						<Ionicons name="add" size={18} color="white" />
						<Text style={styles.addButtonText}>Añadir Gasto</Text>
					</TouchableOpacity>
				</View>

				{expenses.length > 0 && (
					<View style={styles.expensesContainer}>
						<View style={styles.sectionHeader}>
							<Ionicons name="list-outline" size={18} color="#4a6cff" />
							<Text style={styles.sectionTitle}>Gastos Registrados</Text>
						</View>
						<View style={styles.expensesList}>
							{expenses.map((exp) => (
								<View key={exp.id} style={styles.expenseItem}>
									<TouchableOpacity onPress={() => removeExpense(exp.id)}>
										<Ionicons name="trash-outline" size={16} color="#dc3545" />
									</TouchableOpacity>
									<Text style={styles.expenseText}>
										{exp.name}: <Text style={styles.amountText}>${exp.amount.toFixed(2)}</Text>
									</Text>
								</View>
							))}
							<View style={styles.totalExpenses}>
								<Ionicons name="calculator-outline" size={16} color="#333" />
								<Text style={styles.totalText}>Total gastos: ${calculateTotal().toFixed(2)}</Text>
							</View>
						</View>
					</View>
				)}

				<View style={styles.inputSection}>
					<Text style={styles.label}>
						<Ionicons name="cash-outline" size={16} color="#555" /> Total a pagar
					</Text>
					<TextInput
						style={styles.input}
						keyboardType="numeric"
						placeholder="Ingrese el Total a pagar"
						value={finalPrice}
						onChangeText={setFinalPrice}
					/>
				</View>

				{profitResult && (
					<View style={[
						styles.resultBox,
						profitResult.profit >= 0 ? styles.profitBox : styles.lossBox
					]}>
						<View style={styles.resultRow}>
							<Ionicons
								name={profitResult.profit >= 0 ? "trending-up-outline" : "trending-down-outline"}
								size={20}
								color={profitResult.profit >= 0 ? "#28a745" : "#dc3545"}
							/>
							<Text style={styles.resultText}>
								{profitResult.profit >= 0 ? 'Ganancia' : 'Pérdida'}:{' '}
								<Text style={profitResult.profit >= 0 ? styles.profitText : styles.lossText}>
									${Math.abs(profitResult.profit).toFixed(2)} ({profitResult.percentage.toFixed(2)}%)
								</Text>
							</Text>
						</View>
					</View>
				)}

				<TouchableOpacity
					style={[
						styles.printButton,
						isPrintDisabled() && styles.disabledButton
					]}
					onPress={handleSave}
					disabled={isPrintDisabled()}
				>
					<Text style={[
						styles.printButtonText,
						isPrintDisabled() && styles.disabledButtonText
					]}>
						Guardar Factura
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#f8f9fa',
	},
	container: {
		padding: 16,
		paddingBottom: 40,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		marginLeft: 10,
		color: '#333',
	},
	inputSection: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		marginBottom: 8,
		color: '#555',
		flexDirection: 'row',
		alignItems: 'center',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 12,
		backgroundColor: '#fff',
	},
	addButton: {
		backgroundColor: '#4a6cff',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
	},
	addButtonText: {
		color: '#fff',
		fontWeight: 'bold',
	},
	expensesContainer: {
		marginBottom: 20,
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
		color: '#333',
	},
	expensesList: {
		marginTop: 8,
	},
	expenseItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	expenseText: {
		fontSize: 14,
		color: '#333',
		marginLeft: 8,
	},
	amountText: {
		fontWeight: '500',
	},
	totalExpenses: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: '#ddd',
	},
	totalText: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#333',
		marginLeft: 8,
	},
	resultBox: {
		padding: 16,
		borderRadius: 8,
		marginBottom: 20,
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	profitBox: {
		borderLeftWidth: 4,
		borderLeftColor: '#28a745',
	},
	lossBox: {
		borderLeftWidth: 4,
		borderLeftColor: '#dc3545',
	},
	resultRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	resultText: {
		fontSize: 16,
		marginLeft: 8,
		color: '#333',
	},
	profitText: {
		color: '#28a745',
		fontWeight: 'bold',
	},
	lossText: {
		color: '#dc3545',
		fontWeight: 'bold',
	},
	printButton: {
		backgroundColor: '#28a745',
		padding: 16,
		borderRadius: 8,
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
	disabledButton: {
		backgroundColor: '#cccccc',
	},
	disabledButtonText: {
		color: '#999999',
	},
});

export default BillingScreen;