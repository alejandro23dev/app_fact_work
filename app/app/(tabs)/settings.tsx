import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View } from '@/components/Themed';
import { saveImageLocally, getLocalImage } from '../../assets/utils/localStorage';
import { Switch } from 'react-native';

const { width } = Dimensions.get('window');

export default function Settings() {
  const [companyName, setCompanyName] = useState<string>('Nombre de la Compañía');
  const [inputCompanyName, setInputCompanyName] = useState<string>('');
  const [companyImage, setCompanyImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'seguridad' | 'cuenta'>('cuenta');
  const [isLoading, setIsLoading] = useState(false);
  const [securityEnabled, setSecurityEnabled] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedCompanyName = await AsyncStorage.getItem('companyName');
        if (storedCompanyName) setCompanyName(storedCompanyName);

        const imageUri = await getLocalImage('companyImage');
        if (imageUri) setCompanyImage(imageUri);
      } catch (error) {
        console.error('Error loading company data:', error);
      }
    };

    const loadSecurity = async () => {
      try {
        const storedSecurity = await AsyncStorage.getItem('security');
        setSecurityEnabled(storedSecurity === '1');
      } catch (error) {
        console.error('Error loading security:', error);
      }
    };

    loadInitialData();
    loadSecurity();
  }, []);

  const toggleSecurity = async () => {
    try {
      const newValue = !securityEnabled;
      setSecurityEnabled(newValue);

      await AsyncStorage.setItem('security', newValue ? '1' : '0');

      Alert.alert("Seguridad", newValue ? "Protección activada 🔒" : "Protección desactivada 🔓");
    } catch (error) {
      console.error('Error toggling security:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado de seguridad');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const savedUri = await saveImageLocally(result.assets[0].uri, 'companyImage');
        setCompanyImage(savedUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const saveChanges = async () => {
    if (!inputCompanyName && !companyImage) {
      Alert.alert('Sin cambios', 'No hay cambios para guardar');
      return;
    }

    setIsLoading(true);

    try {
      if (inputCompanyName) {
        await AsyncStorage.setItem('companyName', inputCompanyName);
        setCompanyName(inputCompanyName);
        setInputCompanyName('');
      }

      Alert.alert('Éxito', 'Cambios guardados correctamente');
    } catch (error) {
      console.error('Error saving changes:', error);
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    } finally {
      setIsLoading(false);
    }
  };

  const clearInvoices = async () => {
    Alert.alert(
      "Confirmación",
      "¿Seguro que deseas borrar todas las facturas? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setCompanyName("Nombre de la Compañía");
              setCompanyImage(null);
              Alert.alert("Éxito", "Todas las facturas han sido eliminadas");
            } catch (error) {
              console.error("Error al borrar facturas:", error);
              Alert.alert("Error", "No se pudieron borrar las facturas");
            }
          },
        },
      ]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'cuenta':
        return (
          <View style={styles.tabContentContainer}>
            <View style={styles.imageSection}>
              <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                <Ionicons name="camera" size={40} color="#888" />
                <Text style={styles.imagePickerText}>
                  {companyImage ? 'Cambiar imagen' : 'Agregar imagen'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.floatingLabel}>Nombre del negocio</Text>
              <TextInput
                style={styles.input}
                onChangeText={setInputCompanyName}
                value={inputCompanyName}
                placeholder={companyName || "Introduzca el nombre de su negocio"}
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={saveChanges}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Guardar cambios</Text>}
            </TouchableOpacity>
          </View>
        );
      case 'seguridad':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={{ fontSize: 16, marginBottom: 20 }}>
              Activa la seguridad biométrica para proteger la aplicación.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>Protección con FaceID/Huella/PIN</Text>
              <Switch value={securityEnabled} onValueChange={toggleSecurity} />
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.profileContainer}>
              {companyImage ? (
                <Image source={{ uri: companyImage }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="business" size={120} color="#1877f2" style={styles.avatarIcon} />
              )}
              <Text style={styles.company}>{companyName || 'Negocio no definido'}</Text>
            </View>

            <View style={styles.tabBar}>
              <TouchableOpacity
                onPress={() => setActiveTab('cuenta')}
                style={[styles.tabButton, activeTab === 'cuenta' && styles.activeTab]}
              >
                <Ionicons name="person" size={20} color={activeTab === 'cuenta' ? '#1877f2' : '#888'} />
                <Text style={[styles.tabButtonText, activeTab === 'cuenta' && styles.activeTabText]}>Cuenta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('seguridad')}
                style={[styles.tabButton, activeTab === 'seguridad' && styles.activeTab]}
              >
                <Ionicons name="lock-closed" size={20} color={activeTab === 'seguridad' ? '#1877f2' : '#888'} />
                <Text style={[styles.tabButtonText, activeTab === 'seguridad' && styles.activeTabText]}>Seguridad</Text>
              </TouchableOpacity>
            </View>

            {renderTabContent()}
          </ScrollView>
        </KeyboardAvoidingView>
        <TouchableOpacity style={styles.deleteButton} onPress={clearInvoices}>
          <Text style={styles.deleteButtonText}>Borrar Facturas</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarIcon: {
    marginBottom: 10,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  company: {
    fontSize: 22,
    fontWeight: '500',
    color: '#999',
    marginTop: 10,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    width: width,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabButtonText: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1877f2',
  },
  activeTabText: {
    color: '#1877f2',
    fontWeight: '600',
  },
  tabContentContainer: {
    padding: 20,
    paddingTop: 25,
    width: width,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    color: '#999',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  companyImage: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    marginTop: 8,
    color: '#1877f2',
    fontSize: 14,
  },
  floatingLabel: {
    position: 'absolute',
    left: 10,
    top: -10,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 5,
    fontSize: 12,
    color: '#666',
    zIndex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#a0c4ff',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ff4d4f',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

});