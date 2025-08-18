import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>⚙️ Manual de Configuración</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Gestión de Cuenta</Text>
          <View style={styles.feature}>
            <Ionicons name="business-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Imagen del negocio:</Text> Personaliza con tu logo o foto desde la galería
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="pencil-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Nombre del negocio:</Text> Aparecerá en tus facturas y reportes
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="save-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Guardar cambios:</Text> Confirma las modificaciones realizadas
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Configuración de Seguridad</Text>
          <View style={styles.feature}>
            <Ionicons name="finger-print-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Protección biométrica:</Text> Activa FaceID, TouchID o PIN para acceder
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Estado:</Text> Visualiza si la protección está activa/desactivada
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Administración de Datos</Text>
          <View style={styles.feature}>
            <Ionicons name="trash-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Borrar facturas:</Text> Elimina todos los registros de facturación
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="warning-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Confirmación:</Text> Requiere confirmación explícita para borrar datos
            </Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={20} color="#f5a623" />
          <Text style={styles.tipText}>
            <Text style={styles.bold}>Consejo:</Text> Configura la seguridad biométrica para proteger tu información financiera
          </Text>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            ℹ️ Los cambios se aplican inmediatamente después de guardar
          </Text>
        </View>

        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2f95dc',
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'rgba(47,149,220,0.05)',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2f95dc',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginLeft: 10,
    flexShrink: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,166,35,0.1)',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  tipText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#666',
    flexShrink: 1,
  },
  note: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  noteText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});