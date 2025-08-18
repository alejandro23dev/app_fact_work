import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>📝 Manual de Creación de Facturas</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Información Básica</Text>
          <View style={styles.feature}>
            <Ionicons name="document-text-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Número de Factura:</Text> Generado automáticamente (formato INV-XXXX)
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="pencil-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Nombre de Factura:</Text> Identificador único para tu referencia
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="person-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Cliente:</Text> Puedes escribir manualmente o seleccionar de contactos
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="calendar-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Fecha:</Text> Selecciona con el calendario interactivo
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Gestión de Gastos</Text>
          <View style={styles.feature}>
            <Ionicons name="list-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Agregar gastos:</Text> Descripción + Valor (puedes añadir múltiples)
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="trash-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Eliminar:</Text> Toque el icono de basura para remover gastos
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="toggle-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Sin gastos:</Text> Activa el switch si no hay gastos asociados
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Cálculos Automáticos</Text>
          <View style={styles.feature}>
            <Ionicons name="calculator-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Tasa de impuesto:</Text> Configurable (predeterminado 10%)
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="cash-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Subtotal:</Text> Suma de todos los gastos
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="receipt-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Total:</Text> Subtotal + Impuestos calculados automáticamente
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Guardado y Seguridad</Text>
          <View style={styles.feature}>
            <Ionicons name="save-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Guardar:</Text> Almacena la factura localmente en tu dispositivo
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="warning-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Validación:</Text> Todos los campos requeridos deben completarse
            </Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={20} color="#f5a623" />
          <Text style={styles.tipText}>
            <Text style={styles.bold}>Consejo:</Text> Usa nombres descriptivos para facturas y gastos para facilitar búsquedas posteriores
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
});