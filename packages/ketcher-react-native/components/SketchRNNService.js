import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const sketchRnnHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sketch RNN Service</title>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.15.0/dist/tf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@magenta/sketch@0.2.0/dist/magentasketch.min.js"></script>
    <script>
        let model = null;
        
        async function loadModel() {
            try {
                model = await ms.SketchRNN.getModels('chemical');
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'modelLoaded'
                }));
            } catch (error) {
                console.error('Error loading model:', error);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'error',
                    message: error.message
                }));
            }
        }
        
        async function generateSuggestions(input) {
            try {
                if (!model) {
                    throw new Error('Model not loaded');
                }
                
                const sketchInput = convertStructureToSketch(input);
                
                const suggestions = await model.generateSuggestions(sketchInput);
                
                const structureSuggestions = suggestions.map(convertSketchToStructure);
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'suggestions',
                    data: structureSuggestions
                }));
            } catch (error) {
                console.error('Error generating suggestions:', error);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'error',
                    message: error.message
                }));
            }
        }
        
        function convertStructureToSketch(structure) {
            return [];
        }
        
        function convertSketchToStructure(sketch) {
            return {
                id: Math.random().toString(36).substring(2, 9),
                name: 'Suggested Structure',
                structure: ''
            };
        }
        
        window.addEventListener('message', function(event) {
            try {
                const message = JSON.parse(event.data);
                
                if (message.type === 'loadModel') {
                    loadModel();
                } else if (message.type === 'generateSuggestions') {
                    generateSuggestions(message.data);
                }
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });
        
        document.addEventListener('DOMContentLoaded', loadModel);
    </script>
</head>
<body>
    <div id="sketch-rnn-container"></div>
</body>
</html>
`;

const SketchRNNService = forwardRef(({ onSuggestionsGenerated, onModelLoaded, onError }, ref) => {
  const webViewRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useImperativeHandle(ref, () => ({
    generateSuggestions: (structureData) => {
      if (webViewRef.current && isLoaded) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'generateSuggestions',
          data: structureData
        }));
      } else {
        console.warn('Sketch RNN model not loaded yet');
      }
    }
  }));
  
  const onMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'modelLoaded') {
        setIsLoaded(true);
        if (onModelLoaded) onModelLoaded();
      } else if (message.type === 'suggestions') {
        if (onSuggestionsGenerated) onSuggestionsGenerated(message.data);
      } else if (message.type === 'error') {
        if (onError) onError(message.message);
      }
    } catch (err) {
      console.error('Failed to parse message:', err);
      if (onError) onError('Failed to parse message: ' + err.message);
    }
  };
  
  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: sketchRnnHtml }}
        style={styles.webview}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('SketchRNN WebView error:', nativeEvent);
          if (onError) onError('Failed to load Sketch RNN: ' + nativeEvent.description);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 0,
    width: 0,
  },
  webview: {
    height: 1,
    width: 1,
  },
});

export default SketchRNNService;
