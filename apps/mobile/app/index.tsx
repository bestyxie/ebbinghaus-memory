import { StyleSheet, View, Text } from 'react-native';
import { REVIEW_BATCH_SIZE } from '@ebbinghaus/shared';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ebbinghaus Memory</Text>
      <Text style={styles.subtitle}>移动 App · 脚手架 OK</Text>
      <Text style={styles.evidence}>
        shared 包已接入 · REVIEW_BATCH_SIZE = {REVIEW_BATCH_SIZE}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  evidence: { fontSize: 12, color: '#374151', fontFamily: 'monospace' },
});