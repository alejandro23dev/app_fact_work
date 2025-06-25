import React, { useState, useCallback } from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Text,
	View,
	ScrollView,
	Dimensions,
	TouchableOpacity,
	Platform,
	Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';
import Pdf from 'react-native-pdf';

const { width } = Dimensions.get('window');

const BillingHistory: React.FC = () => {
	const [invoices, setInvoices] = useState<any[]>([]);
	const [captureViewRefs, setCaptureViewRefs] = useState<{ [key: number]: any }>({});

	const getData = async (key: string): Promise<any> => {
		try {
			const value = await AsyncStorage.getItem(key);
			return value ? JSON.parse(value) : null;
		} catch (error) {
			console.error('Error al leer AsyncStorage:', error);
			return null;
		}
	};

	const generateInvoicePdf = async (invoice: any, index: number) => {
		try {
			// 1. Capturar la vista como imagen
			const uri = await captureRef(captureViewRefs[index], {
				format: 'png',
				quality: 1,
			});

			// 2. Crear un PDF simple con la imagen
			const fileName = `Factura_${invoice.invoiceName || index}_${Date.now()}.pdf`;
			const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

			const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${invoice.invoiceName || `Factura ${index + 1}`}</title>
            <style>
              body { font-family: Arial; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .invoice-title { font-size: 18px; font-weight: bold; }
              .invoice-date { font-size: 12px; color: #666; }
              .row { display: flex; margin: 5px 0; }
              .label { width: 100px; color: #666; }
              .value { font-weight: 500; }
              .profit { margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="invoice-title">${invoice.invoiceName || `Factura ${index + 1}`}</div>
              <div class="invoice-date">Fecha: ${new Date(invoice.createdAt).toLocaleDateString()}</div>
            </div>
            
            <div class="row">
              <div class="label">Gastos:</div>
              <div class="value">$${invoice.expenses?.reduce((acc: number, val: any) => acc + (val.amount || 0), 0).toFixed(2) || '0.00'}</div>
            </div>
            
            <div class="row">
              <div class="label">Total a pagar:</div>
              <div class="value">$${Number(invoice.finalPrice).toFixed(2)}</div>
            </div>
            
            <div class="row profit">
              <div class="label">${invoice.finalPrice - totalExpenses >= 0 ? 'Ganancia:' : 'Pérdida:'}</div>
              <div class="value">$${Math.abs(invoice.finalPrice - totalExpenses).toFixed(2)} (${totalExpenses > 0 ? ((invoice.finalPrice - totalExpenses) / totalExpenses * 100).toFixed(2) : '0.00'}%)</div>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px;">
              Gracias por su preferencia
            </div>
          </body>
        </html>
      `;

			await RNFS.writeFile(filePath, htmlContent, 'utf8');

			// 3. Compartir el archivo
			const shareOptions = {
				title: 'Compartir Factura',
				message: `Aquí tienes la factura: ${invoice.invoiceName || `Factura ${index + 1}`}`,
				url: `file://${filePath}`,
				type: 'application/pdf',
				subject: `Factura ${invoice.invoiceName || index + 1}`,
			};

			await Share.open(shareOptions);

		} catch (error) {
			console.error('Error al generar PDF:', error);
			Alert.alert('Error', 'No se pudo generar el PDF de la factura');
		}
	};

	const handlePrintInvoice = async (invoice: any, index: number) => {
		try {
			await generateInvoicePdf(invoice, index);
		} catch (error) {
			console.error('Error al imprimir factura:', error);
			Alert.alert('Error', 'No se pudo compartir la factura');
		}
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
										if (ref) {
											setCaptureViewRefs(prev => ({ ...prev, [index]: ref }));
										}
									}}
								>
									<View style={styles.invoiceHeader}>
										<Ionicons name="receipt-outline" size={20} color="#4a6cff" />
										<Text style={styles.invoiceTitle}>{invoice.invoiceName}</Text>
										<Text style={styles.invoiceDate}>
											<Ionicons name="calendar-outline" size={14} color="#666" />
											{' ' + new Date(invoice.createdAt).toLocaleDateString()}
										</Text>
									</View>

									<View style={styles.invoiceRow}>
										<Ionicons name="card-outline" size={18} color="#666" />
										<Text style={styles.invoiceLabel}>Gastos:</Text>
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

									<TouchableOpacity
										style={styles.printButton}
										onPress={() => handlePrintInvoice(invoice, index)}
									>
										<Ionicons name="share-outline" size={18} color="#fff" />
										<Text style={styles.printButtonText}>Compartir Factura</Text>
									</TouchableOpacity>
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
	invoiceDate: {
		fontSize: 12,
		color: '#666',
	},
	invoiceRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 6,
	},
	invoiceLabel: {
		fontSize: 14,
		color: '#666',
		marginLeft: 8,
		marginRight: 10,
		width: 80,
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
	printButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#4a6cff',
		padding: 12,
		borderRadius: 8,
		marginTop: 15,
	},
	printButtonText: {
		color: '#fff',
		fontWeight: 'bold',
		marginLeft: 8,
	},
});

export default BillingHistory;