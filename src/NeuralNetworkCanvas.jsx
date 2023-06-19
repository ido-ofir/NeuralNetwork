import React, { useRef, useEffect } from 'react';

const getColor = (value) => {
    // Ensure the value is within the expected range
    value = Math.max(-1, Math.min(1, value));
  
    // Map the value from [-1, 1] to [0, 120]
    const hue = ((value + 1) / 2) * 120;
  
    // Return an HSL color string
    return `hsl(${hue}, 100%, 50%)`;
  }
export const NeuralNetworkCanvas = ({ network }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Determine size of canvas based on network size
        const layerCount = network.length;
        let minWeight = 100;
        let maxWeight = -100;
        let minBias = 100;
        let maxBias = -100;
        const maxNeuronCount = Math.max(...network.map((layer, i) => {
            i > 0 && layer.map(t => {
                minWeight = Math.min(minWeight, ...t.weights);
                maxWeight = Math.max(maxWeight, ...t.weights);
                minBias = Math.min(minBias, t.bias);
                maxBias = Math.max(maxBias, t.bias);
            })
            return layer.length
        }));
        canvas.height = layerCount * 100; // Space layers 100px apart vertically
        canvas.width = maxNeuronCount * 100; // Space neurons 100px apart horizontally
        const weightSpread = maxWeight - minWeight;
        const biasSpread = maxBias - minBias;
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Iterate over layers
        for (let i = 0; i < network.length; i++) {
            const layer = network[i];
            const layerNeuronCount = layer.length;

            // Calculate horizontal start position
            const startHorizontalPos = (canvas.width - (layerNeuronCount * 100)) / 2;

            // Iterate over neurons in layer
            for (let j = 0; j < layer.length; j++) {
                const neuron = layer[j];
                
                // Draw neuron
                const bias = (neuron.bias - minBias) / biasSpread * 120
                context.beginPath();
                context.arc(startHorizontalPos + j * 100 + 50, i * 100 + 50, 20, 0, 2 * Math.PI, false);
                context.fillStyle = `hsl(${bias}, 100%, 50%)`;
                context.fill();
                
                // If not the first layer, draw weights
                if (i > 0) {
                    const prevLayer = network[i - 1];
                    const prevLayerNeuronCount = prevLayer.length;
                    const startPrevLayerPos = (canvas.width - (prevLayerNeuronCount * 100)) / 2;

                    for (let k = 0; k < prevLayer.length; k++) {
                        const weight = (neuron.weights[k] - minWeight) / weightSpread * 120
                        context.beginPath();
                        context.moveTo(startPrevLayerPos + k * 100 + 50, (i - 1) * 100 + 50);
                        context.lineTo(startHorizontalPos + j * 100 + 50, i * 100 + 50);
                        context.lineWidth = Math.abs(neuron.weights[k]) * 2;
                        context.strokeStyle = `hsl(${weight}, 100%, 50%)`;
                        context.stroke();
                    }
                }
            }
        }
    }, [network]);

    return (
        <canvas ref={canvasRef} />
    );
}

