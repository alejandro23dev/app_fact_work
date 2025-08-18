import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveImageLocally = async (uri: string, key: string): Promise<string> => {
    try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        await AsyncStorage.setItem(key, base64);

        return uri;
    } catch (error) {
        console.error('Error al guardar imagen localmente:', error);
        throw error;
    }
};

export const getLocalImage = async (key: string): Promise<string | null> => {
    try {
        const base64 = await AsyncStorage.getItem(key);
        if (base64) {
            return `data:image/jpeg;base64,${base64}`;
        }
        return null;
    } catch (error) {
        console.error('Error al obtener imagen local:', error);
        return null;
    };
};

export const removeLocalImage = async (key: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error al borrar imagen local:', error);
        throw error;
    }
};

export const saveData = async (key: string, value: any): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.error('Error al guardar:', e);
    }
};

export const getData = async (key: string): Promise<any> => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Error al leer:', e);
        return null;
    }
};