import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, Alert } from 'react-native';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const ShareStructure = ({ structure, format = 'molfile' }) => {
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(structure);
      Alert.alert('Success', 'Structure copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const shareStructure = async () => {
    try {
      const result = await Share.share({
        message: structure,
        title: 'Chemical Structure',
      });
    } catch (error) {
      console.error('Error sharing structure:', error);
      Alert.alert('Error', 'Failed to share structure');
    }
  };

  const shareAsFile = async () => {
    try {
      const fileUri = `${FileSystem.cacheDirectory}structure.${format === 'molfile' ? 'mol' : 'json'}`;
      await FileSystem.writeAsStringAsync(fileUri, structure);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert('Error', 'Failed to share file');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
        <Text style={styles.buttonText}>Copy to Clipboard</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={shareStructure}>
        <Text style={styles.buttonText}>Share as Text</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={shareAsFile}>
        <Text style={styles.buttonText}>Share as File</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ShareStructure;
