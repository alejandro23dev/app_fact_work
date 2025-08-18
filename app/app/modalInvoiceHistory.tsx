import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>📚 Manual del Historial de Facturas</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Visualización de Facturas</Text>
          <View style={styles.feature}>
            <Ionicons name="list-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Listado completo:</Text> Todas tus facturas aparecen ordenadas cronológicamente
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="search-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Información clave:</Text> Cada tarjeta muestra nombre, número, cliente, fecha y total
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="alert-circle-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Sin facturas:</Text> Mensaje claro cuando no hay registros
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Gestión de Facturas</Text>
          <View style={styles.feature}>
            <Ionicons name="chevron-down-circle-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Expandir/Contraer:</Text> Ver detalles de gastos con un toque
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="share-social-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Compartir:</Text> Envía los detalles de la factura por cualquier app
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="refresh-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Actualización:</Text> Los datos se cargan automáticamente al abrir la vista
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Detalles de Gastos</Text>
          <View style={styles.feature}>
            <Ionicons name="receipt-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Lista clara:</Text> Todos los gastos asociados a la factura
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="cash-outline" size={18} color="#2f95dc" />
            <Text style={styles.text}>
              <Text style={styles.bold}>Formato:</Text> Descripción + Valor con alineación clara
            </Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={20} color="#f5a623" />
          <Text style={styles.tipText}>
            <Text style={styles.bold}>Consejo:</Text> Desliza hacia abajo para actualizar el listado si no ves facturas recientes
          </Text>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            ℹ️ Los datos se almacenan localmente en tu dispositivo y persisten entre sesiones
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