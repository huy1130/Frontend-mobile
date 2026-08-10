import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Logo({ size = 'md', showText = true, style }: LogoProps) {
  const sizeStyles = {
    sm: { height: 48, width: 128 },
    md: { height: 80, width: 192 },
    lg: { height: 96, width: 224 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, currentSize, style]}>
      <Image
        source={require('../../assets/images/logo-wash.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
