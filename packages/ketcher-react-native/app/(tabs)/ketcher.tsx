import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import KetcherEditor from '@/components/KetcherEditor';
import StructureSuggestions from '@/components/StructureSuggestions';
import SketchRNNService from '@/components/SketchRNNService';

export default function KetcherScreen() {
  const [currentStructure, setCurrentStructure] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState(null);
  const sketchRnnRef = useRef(null);
  const ketcherEditorRef = useRef(null);
  
  const handleStructureChange = (structure) => {
    setCurrentStructure(structure);
    
    if (sketchRnnRef.current && sketchRnnRef.current.generateSuggestions) {
      sketchRnnRef.current.generateSuggestions(structure);
    }
  };
  
  const handleSelectSuggestion = (suggestion) => {
    if (ketcherEditorRef.current && ketcherEditorRef.current.setStructure) {
      ketcherEditorRef.current.setStructure(suggestion.structure);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KetcherEditor ref={ketcherEditorRef} onStructureChange={handleStructureChange} />
      <StructureSuggestions 
        onSelectSuggestion={handleSelectSuggestion} 
        currentStructure={currentStructure} 
      />
      <SketchRNNService 
        ref={sketchRnnRef}
        onSuggestionsGenerated={setSuggestions}
        onModelLoaded={() => setModelLoaded(true)}
        onError={setError}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
