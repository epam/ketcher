import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

const mockSuggestions = [
  { id: '1', name: 'Benzene' },
  { id: '2', name: 'Cyclohexane' },
  { id: '3', name: 'Carboxylic Acid' },
  { id: '4', name: 'Amine' },
  { id: '5', name: 'Alcohol' },
];

const StructureSuggestions = ({ onSelectSuggestion, currentStructure }) => {
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async (structureData) => {
    setLoading(true);
    
    setTimeout(() => {
      setSuggestions(mockSuggestions);
      setLoading(false);
    }, 1000);
    
  };

  useEffect(() => {
    if (currentStructure) {
      generateSuggestions(currentStructure);
    }
  }, [currentStructure]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggestions</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionItem}
              onPress={() => onSelectSuggestion(suggestion)}
            >
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>{suggestion.name}</Text>
              </View>
              <Text style={styles.suggestionName}>{suggestion.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollView: {
    flexDirection: 'row',
  },
  suggestionItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 80,
  },
  placeholder: {
    width: 70,
    height: 70,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  suggestionName: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default StructureSuggestions;
