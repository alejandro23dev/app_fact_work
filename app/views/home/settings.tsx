import React, { useState, useEffect } from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Text,
	View,
	Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SettingsScreen: React.FC = () => {
	const [userName, setUserName] = useState<string | null>(null);

	useEffect(() => {
		// const loadUserName = async () => {
		// 	try {
		// 		const storedName = await AsyncStorage.getItem('userID');
		// 		setUserName(storedName);
		// 	} catch (error) {
		// 		console.error('Error loading user name:', error);
		// 	}
		// };

		// loadUserName();
	}, []);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<Text style={styles.nameText}>
					{userName ? `Bienvenido, ${userName}` : 'Cargando nombre...'}
				</Text>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		width,
		alignItems: 'center',
	},
	nameText: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#1877f2',
	},
});

export default SettingsScreen;
