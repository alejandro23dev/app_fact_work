import React, { useState, useCallback } from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Text,
	View,
	ScrollView,
	Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const BillingHistory: React.FC = () => {
	const [userName, setUserName] = useState<string | null>(null);
	const [invoices, setInvoices] = useState<any[]>([]);

	const getData = async (key: string): Promise<any> => {
		try {
			const value = await AsyncStorage.getItem(key);
			return value ? JSON.parse(value) : null;
		} catch (error) {
			console.error('Error al leer AsyncStorage:', error);
			return null;
		}
	};

	useFocusEffect(
		useCallback(() => {
			const loadData = async () => {
				try {
					// AsyncStorage.clear();
					const name = await AsyncStorage.getItem('userID');
					setUserName(name || 'Usuario');

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

					<Text style={styles.sectionTitle}>Historial de Facturas</Text>

					{invoices.length === 0 ? (
						<Text style={styles.emptyText}>No hay facturas registradas.</Text>
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
								<View key={index} style={styles.invoiceCard}>
									<Text style={styles.invoiceTitle}>Factura #{index + 1}</Text>
									<Text>Total: ${Number(invoice.finalPrice).toFixed(2)}</Text>
									<Text>Gastos: ${totalExpenses.toFixed(2)}</Text>

									<Text>
										{profit >= 0 ? 'Ganancia' : 'Pérdida'}: ${profit} ({percentage}%)
									</Text>
									<Text style={styles.dateText}>
										Fecha: {new Date(invoice.createdAt).toLocaleString()}
									</Text>
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
		backgroundColor: '#fff',
	},
	scrollContent: {
		padding: 20,
		paddingBottom: 40,
	},
	container: {
		width: width - 40,
		alignSelf: 'center',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#1877f2',
		marginBottom: 20,
		textAlign: 'center',
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#444',
		marginBottom: 10,
	},
	emptyText: {
		textAlign: 'center',
		color: '#888',
		fontSize: 16,
		marginTop: 20,
	},
	invoiceCard: {
		backgroundColor: '#f0f4ff',
		borderRadius: 10,
		padding: 15,
		marginBottom: 15,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	invoiceTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 5,
		color: '#333',
	},
	dateText: {
		marginTop: 5,
		fontSize: 12,
		color: '#666',
	},
});

export default BillingHistory;
