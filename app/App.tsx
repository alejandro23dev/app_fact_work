import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';  // Para navegación Stack
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';  // Para la navegación por pestañas
import { Ionicons } from '@expo/vector-icons';  // Para los iconos
import BillingScreen from './views/home/billing';  // Pantalla principal (Home)
import BillingHistory from './views/home/billingHistory';  // Pantalla de Registros
import SettingsScreen from './views/home/settings';  // Pantalla de Ajustes

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Pantalla con las pestañas
function HomeTabs() {
	return (
		<Tab.Navigator
			screenOptions={{
				tabBarActiveTintColor: '#1877f2',  // Cambiar color cuando activo
				tabBarInactiveTintColor: '#8e8e8e',  // Cambiar color cuando inactivo
			}}
		>
			<Tab.Screen
				name="Facturar"
				component={BillingScreen}
				options={{
					headerShown: false,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" color={color} size={size} />  // Icono de inicio
					),
				}}
			/>
			<Tab.Screen
				name="Registro de Facturas"
				component={BillingHistory}
				options={{
					headerShown: false,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="create" color={color} size={size} />  // Icono para registros
					),
				}}
			/>
			<Tab.Screen
				name="Ajustes"
				component={SettingsScreen}
				options={{
					headerShown: false,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="settings" color={color} size={size} />  // Icono de ajustes
					),
				}}
			/>
		</Tab.Navigator>
	);
}

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Home">
				<Stack.Screen
					name="Home"
					component={HomeTabs}
					options={{
						headerShown: false,
						gestureEnabled: false,
					}}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
