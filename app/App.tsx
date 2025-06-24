import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';  // Para navegación Stack
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';  // Para la navegación por pestañas
import { Ionicons } from '@expo/vector-icons';  // Para los iconos
import HomeScreen from './views/home/dashboard';  // Pantalla principal (Home)
import RegisterScreen from './views/home/register';  // Pantalla de Registros
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
				name="Dashboard"
				component={HomeScreen}
				options={{
					headerShown: false,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" color={color} size={size} />  // Icono de inicio
					),
				}}
			/>
			<Tab.Screen
				name="Records"
				component={RegisterScreen}
				options={{
					headerShown: false,
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="create" color={color} size={size} />  // Icono para registros
					),
				}}
			/>
			<Tab.Screen
				name="Settings"
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
