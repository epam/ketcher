import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, SafeAreaView, Button, Share, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const ketcherHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Ketcher</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            touch-action: manipulation;
        }
        #ketcher-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        }
        /* Touch-friendly toolbar styling */
        .ketcher-toolbar button {
            min-width: 40px;
            min-height: 40px;
            padding: 10px;
            margin: 5px;
        }
        /* Hide placeholder when editor is loaded */
        .editor-placeholder {
            display: none;
        }
    </style>
    <!-- Ketcher dependencies -->
    <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@epam/ketcher/dist/ketcher.standalone.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@epam/ketcher/dist/ketcher.css">
</head>
<body>
    <div id="ketcher-container"></div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            try {
                const ketcherApi = window.ketcher;
                
                const provider = new ketcherApi.StandaloneStructServiceProvider();
                
                const editor = new ketcherApi.Editor(document.getElementById('ketcher-container'), {
                    staticResourcesUrl: '/',
                    structServiceProvider: provider
                });
                
                window.ketcherInstance = editor;
                
                window.addEventListener('message', function(event) {
                    try {
                        const message = JSON.parse(event.data);
                        
                        if (message.type === 'getStructure') {
                            const structure = editor.getKetcher().getStructure();
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'structure',
                                data: structure
                            }));
                        } else if (message.type === 'setStructure') {
                            editor.getKetcher().setStructure(message.data);
                        }
                    } catch (error) {
                        console.error('Error handling message:', error);
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'error',
                            message: error.message
                        }));
                    }
                });
                
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'ready'
                    }));
                }
            } catch (error) {
                console.error('Failed to initialize Ketcher:', error);
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'error',
                        message: error.message
                    }));
                }
            }
        });
    </script>
</body>
</html>
`;

const KetcherEditor = forwardRef(({ onStructureChange }, ref) => {
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [structure, setStructure] = useState(null);

  useImperativeHandle(ref, () => ({
    getStructure: () => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'getStructure'
        }));
      }
      return structure;
    },
    setStructure: (structureData) => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'setStructure',
          data: structureData
        }));
      }
    }
  }));

  const onMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'ready') {
        console.log('Ketcher is ready');
        setIsLoading(false);
      } else if (message.type === 'structure') {
        console.log('Received structure:', message.data);
        setStructure(message.data);
        if (onStructureChange) {
          onStructureChange(message.data);
        }
      } else if (message.type === 'error') {
        console.error('Error from Ketcher:', message.message);
        setError('Error: ' + message.message);
      }
    } catch (err) {
      console.error('Failed to parse message:', err);
    }
  };

  const shareStructure = async () => {
    if (!structure) {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'getStructure'
        }));
      }
      return;
    }
    
    try {
      const result = await Share.share({
        message: structure,
        title: 'Chemical Structure'
      });
    } catch (error) {
      console.error('Error sharing structure:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading Ketcher editor...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={() => setError(null)} />
        </View>
      )}
      {!error && (
        <WebView
          ref={webViewRef}
          source={{ html: ketcherHtml }}
          style={styles.webview}
          onMessage={onMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          mixedContentMode="always"
          startInLoadingState={true}
          scalesPageToFit={false}
          bounces={false}
          originWhitelist={['*']}
          onLoad={() => setIsLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            setError('Failed to load Ketcher editor: ' + nativeEvent.description);
          }}
        />
      )}
      <View style={styles.buttonContainer}>
        <Button title="Get Structure" onPress={() => {
          if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'getStructure'
            }));
          }
        }} />
        <Button title="Share" onPress={shareStructure} />
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
});

export default KetcherEditor;
