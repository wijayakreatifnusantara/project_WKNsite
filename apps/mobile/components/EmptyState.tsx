import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  title?: string;
  message?: string;
  animationUri?: string;
}

export default function EmptyState({ 
  title = "Belum Ada Data", 
  message = "Tidak ada data yang tersedia untuk ditampilkan saat ini.",
  animationUri = "https://lottie.host/4a5cb582-7f28-4ce7-bfbd-b7bb57d6052f/Uj4Z7r9R1u.json" // standard empty box Lottie URL
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <LottieView
        autoPlay
        loop
        source={{ uri: animationUri }}
        style={styles.lottie}
      />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.subText }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 40,
  },
  lottie: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  }
});
