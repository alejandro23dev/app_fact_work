import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>📊 Manual del Dashboard Financiero</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Resumen General</Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Facturas:</Text> Muestra el número total de facturas registradas.
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Ingresos:</Text> Suma del total de todas las facturas (incluye impuestos).
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Subtotal:</Text> Suma de los valores antes de impuestos.
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Impuestos:</Text> Total recaudado en impuestos según la tasa aplicada.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Gráfico de Gastos vs Beneficios</Text>
          <Text style={styles.text}>
            • Muestra visualmente la relación entre gastos (rojo) y beneficios (verde) por factura.
          </Text>
          <Text style={styles.text}>
            • Cada barra representa una factura, con su número como etiqueta.
          </Text>
          <Text style={styles.text}>
            • Toque en la leyenda para filtrar datos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Totales por Cliente</Text>
          <Text style={styles.text}>
            • Listado de todos los clientes con su gasto total acumulado.
          </Text>
          <Text style={styles.text}>
            • Ordenado alfabéticamente por nombre de cliente.
          </Text>
          <Text style={styles.text}>
            • Los valores incluyen impuestos aplicados.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Actualización de Datos</Text>
          <Text style={styles.text}>
            • Los datos se actualizan automáticamente al volver a esta pantalla.
          </Text>
          <Text style={styles.text}>
            • Para forzar una actualización, cierre y vuelva a abrir la app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Información Técnica</Text>
          <Text style={styles.text}>
            • Datos almacenados localmente en el dispositivo.
          </Text>
          <Text style={styles.text}>
            • Compatible con iOS y Android.
          </Text>
          <Text style={styles.text}>
            • Versión 1.0.0
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
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2f95dc',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 15,
    height: 1,
    width: '100%',
    backgroundColor: '#eee',
  },
});