import React, { useState, useEffect } from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	TextInput,
	ScrollView,
	Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SettingsScreen: React.FC = () => {
	const [companyName, setCompanyName] = useState<string>('Nombre de la Compañía');
	const [inputCompanyName, setInputCompanyName] = useState<string>();
	const [activeTab, setActiveTab] = useState<'permisos' | 'cuenta'>('cuenta');
	const [isLoading, setIsLoading] = useState(false);
	const navigation = useNavigation<any>();

	const saveData = async (key: string, value: any): Promise<void> => {
		try {
			const jsonValue = JSON.stringify(value);
			await AsyncStorage.setItem(key, jsonValue);
		} catch (e) {
			console.error('Error al guardar:', e);
		}
	};

	const getData = async (key: string): Promise<any> => {
		try {
			const jsonValue = await AsyncStorage.getItem(key);
			return jsonValue != null ? JSON.parse(jsonValue) : null;
		} catch (e) {
			console.error('Error al leer:', e);
			return null;
		}
	};

	useEffect(() => {
		const getCompanyInfo = async () => {
			try {
				const storedCompanyName = await getData('companyName');
				setCompanyName(storedCompanyName);
			} catch (error) {
				console.error('Error loading user name:', error);
			}
		};

		getCompanyInfo();
	}, []);

	const changeAccountInfo = async () => {
		if (!inputCompanyName) {
			Alert.alert('Campos incompletos', 'Por favor complete todos los campos requeridos');
			return;
		}

		setIsLoading(true);

		saveData('companyName', inputCompanyName);
		setInputCompanyName('');
		setCompanyName(inputCompanyName);

		setIsLoading(false);
	};

	const renderTabContent = () => {
		switch (activeTab) {
			// case 'permisos':
			// 	return (
			// 		<View style={styles.tabContentContainer}>

			// 		</View>
			// 	);
			case 'cuenta':
				return (
					<View style={styles.tabContentContainer}>
						{/* Input para el nombre */}
						<View style={styles.inputContainer}>
							<Text style={styles.floatingLabel}>Nombre</Text>
							<TextInput
								style={styles.textInput}
								onChangeText={setInputCompanyName}
								value={inputCompanyName}
								placeholder="Introduzca el nombre de su compañía"
							/>
						</View>

						{/* Botón de guardar */}
						<TouchableOpacity
							style={styles.saveButton}
							onPress={() => changeAccountInfo()}
						>
							<Text style={styles.saveButtonText}>Guardar cambios</Text>
						</TouchableOpacity>
					</View>
				);
			default:
				return null;
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
				<View style={styles.profileContainer}>
					<Ionicons name="person-circle-outline" size={120} color="#1877f2" style={styles.avatarIcon} />
					<Text style={styles.company}>{companyName || 'Compañía no definida'}</Text>
				</View>

				<View style={styles.tabBar}>
					{/* <TouchableOpacity onPress={() => setActiveTab('permisos')} style={[styles.tabButton, activeTab === 'permisos' && styles.activeTab]}>
						<Ionicons name="lock-closed" size={20} color={activeTab === 'permisos' ? '#1877f2' : '#888'} />
						<Text style={[styles.tabButtonText, activeTab === 'permisos' && styles.activeTabText]}>Permisos</Text>
					</TouchableOpacity> */}
					<TouchableOpacity onPress={() => setActiveTab('cuenta')} style={[styles.tabButton, activeTab === 'cuenta' && styles.activeTab]}>
						<Ionicons name="person" size={20} color={activeTab === 'cuenta' ? '#1877f2' : '#888'} />
						<Text style={[styles.tabButtonText, activeTab === 'cuenta' && styles.activeTabText]}>Cuenta</Text>
					</TouchableOpacity>
				</View>

				{renderTabContent()}
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
		paddingTop: 40,
	},
	profileContainer: {
		alignItems: 'center',
		paddingVertical: 20,
		backgroundColor: '#fff',
	},
	avatarIcon: {
		marginBottom: 10,
	},
	company: {
		fontSize: 22,
		color: '#222',
		marginTop: 15,
	},
	tabBar: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		backgroundColor: '#f0f4ff',
		paddingVertical: 10,
		width: width,
	},
	tabButton: {
		alignItems: 'center',
	},
	tabButtonText: {
		fontSize: 16,
		color: '#888',
	},
	activeTab: {
		borderBottomWidth: 2,
		borderBottomColor: '#1877f2',
	},
	activeTabText: {
		color: '#1877f2',
	},
	tabContentContainer: {
		backgroundColor: '#f9f9f9',
		padding: 20,
		paddingTop: 25,
		width: width,
	},
	inputContainer: {
		marginBottom: 20,
		position: 'relative',
	},
	floatingLabel: {
		position: 'absolute',
		left: 10,
		top: -10,
		backgroundColor: 'white',
		paddingHorizontal: 5,
		fontSize: 12,
		color: '#666',
		zIndex: 1,
	},
	textInput: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 5,
		padding: 15,
		fontSize: 16,
	},
	saveButton: {
		backgroundColor: '#007AFF',
		padding: 15,
		borderRadius: 5,
		alignItems: 'center',
		marginTop: 20,
	},
	saveButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
});


export default SettingsScreen;
