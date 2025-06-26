import React, { useState, useCallback, useRef } from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Text,
	View,
	ScrollView,
	Dimensions,
	TouchableOpacity,
	Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

const { width } = Dimensions.get('window');

const BillingHistory: React.FC = () => {
	const [invoices, setInvoices] = useState<any[]>([]);
	const captureViewRefs = useRef<{ [key: number]: any }>({});

	const getData = async (key: string): Promise<any> => {
		try {
			const value = await AsyncStorage.getItem(key);
			return value ? JSON.parse(value) : null;
		} catch (error) {
			console.error('Error al leer AsyncStorage:', error);
			return null;
		}
	};

	const saveData = async (key: string, value: any) => {
		try {
			await AsyncStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error('Error al guardar en AsyncStorage:', error);
		}
	};

	const generateInvoicePngAndShare = async (invoice: any, index: number) => {
		try {
			const uri = await captureRef(captureViewRefs.current[index], {
				format: 'png',
				quality: 1,
			});

			const fileName = `Factura_${invoice.invoiceName || index}_${Date.now()}.png`;
			const destPath = `${FileSystem.cacheDirectory}${fileName}`;

			await FileSystem.copyAsync({
				from: uri,
				to: destPath,
			});

			await Sharing.shareAsync(destPath, {
				dialogTitle: 'Compartir Factura',
				mimeType: 'image/png',
			});
		} catch (error) {
			console.error('Error al compartir la factura:', error);
			Alert.alert('Error', 'No se pudo compartir la factura');
		}
	};

	const handlePrintInvoice = async (invoice: any, index: number) => {
		try {
			await generateInvoicePngAndShare(invoice, index);
		} catch (error) {
			console.error('Error al imprimir factura:', error);
			Alert.alert('Error', 'No se pudo compartir la factura');
		}
	};

	const handleDeleteInvoice = async (index: number) => {
		// Mostrar alerta de confirmación
		Alert.alert(
			'Confirmar eliminación',
			'¿Estás seguro que deseas eliminar esta factura? Esta acción no se puede deshacer.',
			[
				{
					text: 'Cancelar',
					style: 'cancel',
				},
				{
					text: 'Eliminar',
					style: 'destructive',
					onPress: async () => {
						try {
							// Crear una copia del array de facturas
							const updatedInvoices = [...invoices];
							// Eliminar la factura seleccionada
							updatedInvoices.splice(index, 1);
							// Guardar los cambios
							await saveData('invoices', updatedInvoices);
							// Actualizar el estado
							setInvoices(updatedInvoices);
							Alert.alert('Éxito', 'La factura ha sido eliminada correctamente');
						} catch (error) {
							console.error('Error al eliminar factura:', error);
							Alert.alert('Error', 'No se pudo eliminar la factura');
						}
					},
				},
			]
		);
	};

	useFocusEffect(
		useCallback(() => {
			const loadData = async () => {
				try {
					const allInvoices = await getData('invoices');

					if (allInvoices && Array.isArray(allInvoices)) {
						const closedInvoices = allInvoices.filter(
							(inv: any) => inv.currentInvoice === 0
						);
						setInvoices(closedInvoices);
					} else {
						setInvoices([]);
					}
				} catch (err) {
					console.error('Error cargando datos:', err);
				}
			};

			loadData();
		}, [])
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.container}>
					<View style={styles.header}>
						<Ionicons name="receipt-outline" size={24} color="#4a6cff" />
						<Text style={styles.sectionTitle}>Historial de Facturas</Text>
					</View>

					{invoices.length === 0 ? (
						<View style={styles.emptyContainer}>
							<Ionicons name="document-text-outline" size={50} color="#ccc" />
							<Text style={styles.emptyText}>No hay facturas registradas</Text>
						</View>
					) : (
						invoices.map((invoice, index) => {
							const totalExpenses = invoice.expenses && Array.isArray(invoice.expenses)
								? invoice.expenses.reduce(
									(acc: number, val: { amount: number }) => acc + (val.amount || 0),
									0
								)
								: 0;

							const profit = invoice.finalPrice - totalExpenses;
							const percentage = totalExpenses > 0
								? ((profit / totalExpenses) * 100).toFixed(2)
								: '0.00';

							return (
								<View
									key={index}
									style={styles.invoiceCard}
									ref={ref => {
										if (ref && !captureViewRefs.current[index]) {
											captureViewRefs.current[index] = ref;
										}
									}}
								>
									<View style={styles.invoiceHeader}>
										<Text style={styles.invoiceTitle}>{invoice.invoiceName}</Text>
										<Text style={styles.invoiceDate}>
											<Ionicons name="calendar-outline" size={14} color="#666" />
											{' ' + new Date(invoice.createdAt).toLocaleDateString()}
										</Text>
									</View>

									<View style={styles.expensesContainer}>
										<Text style={styles.expensesTitle}>Gastos:</Text>
										{invoice.expenses.map((expense: any, expenseIndex: number) => (
											<View key={expenseIndex} style={styles.expenseItem}>
												<Text style={styles.expenseName}>{expense.name}</Text>
												<Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
											</View>
										))}
									</View>

									<View style={styles.invoiceRow}>
										<Ionicons name="card-outline" size={18} color="#666" />
										<Text style={styles.invoiceLabel}>Total gastos:</Text>
										<Text style={styles.invoiceValue}>${totalExpenses.toFixed(2)}</Text>
									</View>

									<View style={styles.invoiceRow}>
										<Ionicons name="cash-outline" size={18} color="#666" />
										<Text style={styles.invoiceLabel}>Total a pagar:</Text>
										<Text style={styles.invoiceValue}>${Number(invoice.finalPrice).toFixed(2)}</Text>
									</View>

									<View style={[
										styles.invoiceRow,
										styles.profitRow,
										profit >= 0 ? styles.profitPositive : styles.profitNegative
									]}>
										{profit >= 0 ? (
											<Ionicons name="trending-up-outline" size={18} color="#28a745" />
										) : (
											<Ionicons name="trending-down-outline" size={18} color="#dc3545" />
										)}
										<Text style={styles.invoiceLabel}>
											{profit >= 0 ? 'Ganancia:' : 'Pérdida:'}
										</Text>
										<Text style={styles.invoiceValue}>
											${Math.abs(profit).toFixed(2)} ({percentage}%)
										</Text>
									</View>

									<View style={styles.buttonsContainer}>
										<TouchableOpacity
											style={[styles.actionButton, styles.printButton]}
											onPress={() => handlePrintInvoice(invoice, index)}
										>
											<Ionicons name="share-outline" size={18} color="#fff" />
											<Text style={styles.printButtonText}>Compartir</Text>
										</TouchableOpacity>
										<TouchableOpacity
											style={[styles.actionButton, styles.deleteButton]}
											onPress={() => handleDeleteInvoice(index)}
										>
											<Ionicons name="trash-outline" size={18} color="#fff" />
											<Text style={styles.printButtonText}>Eliminar</Text>
										</TouchableOpacity>
									</View>
								</View>
							);
						})
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#f8f9fa',
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 40,
	},
	container: {
		width: width - 32,
		alignSelf: 'center',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		marginLeft: 10,
		color: '#333',
	},
	emptyContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 40,
	},
	emptyText: {
		fontSize: 16,
		color: '#666',
		marginTop: 10,
	},
	invoiceCard: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 3,
	},
	invoiceHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		paddingBottom: 10,
	},
	invoiceTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginLeft: 8,
		color: '#333',
		flex: 1,
	},
	deleteButton: {
		marginRight: 10,
		backgroundColor: '#dc3545'
	},
	invoiceDate: {
		fontSize: 12,
		color: '#666',
	},
	expensesContainer: {
		marginBottom: 12,
		padding: 10,
		backgroundColor: '#f5f5f5',
		borderRadius: 8,
	},
	expensesTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: '#555',
		marginBottom: 8,
	},
	expenseItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 6,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
	},
	expenseName: {
		fontSize: 14,
		color: '#333',
	},
	expenseAmount: {
		fontSize: 14,
		fontWeight: '500',
		color: '#333',
	},
	invoiceRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 10,
	},
	invoiceLabel: {
		fontSize: 14,
		color: '#666',
		marginLeft: 8,
		marginRight: 10,
		width: width - 250,
	},
	invoiceValue: {
		fontSize: 14,
		fontWeight: '500',
		color: '#333',
	},
	profitRow: {
		marginTop: 10,
		paddingTop: 10,
		borderTopWidth: 1,
		borderTopColor: '#eee',
	},
	profitPositive: {
		color: '#28a745',
	},
	profitNegative: {
		color: '#dc3545',
	},
	buttonsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 15,
	},
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 12,
		borderRadius: 8,
		flex: 1,
		marginHorizontal: 5
	},
	printButton: {
		backgroundColor: '#4a6cff',
	},
	printButtonText: {
		color: '#fff',
		fontWeight: 'bold',
		marginLeft: 8,
	},
});

export default BillingHistory;