import React, { useEffect, useRef } from 'react';

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

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
        const maxNeuronCount = Math.max(...network.map((layer, i) => layer.weights?.data.length || 0));
        canvas.height = layerCount * 100; // Space layers 100px apart vertically
        canvas.width = maxNeuronCount * 100; // Space neurons 100px apart horizontally
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Iterate over layers
        for (let i = 0; i < network.length; i++) {
            const layer = network[i];
            const layerNeuronCount = layer.outputs?.data.length || 0;

            // Calculate horizontal start position
            const startHorizontalPos = (canvas.width - (layerNeuronCount * 100)) / 2;

            // Iterate over neurons in layer
            for (let j = 0; j < layerNeuronCount; j++) {


                // If not the first layer, draw weights
                if (i > 0) {
                    const weights = layer.weights.data[j]
                    const prevLayer = network[i - 1];
                    const prevLayerNeuronCount = prevLayer.outputs.data.length;
                    const startPrevLayerPos = (canvas.width - (prevLayerNeuronCount * 100)) / 2;

                    for (let k = 0; k < prevLayer.outputs.data.length; k++) {
                        const output = prevLayer.outputs.data[k][0];
                        context.beginPath();
                        context.moveTo(startPrevLayerPos + k * 100 + 50, (i - 1) * 100 + 50);
                        context.lineTo(startHorizontalPos + j * 100 + 50, i * 100 + 50);
                        context.lineWidth = Math.abs(weights[k]) * 4;
                        const strokeStyle = output >= 0 ? `rgba(255, 0, 0, ${output})` : `rgba(0, 255, 0, ${-output})`
                        context.strokeStyle = strokeStyle;
                        context.stroke();

                        const weight = (sigmoid(weights[k]) + 1) * 127;
                        const weightRgb = `rgb(${weight}, ${weight}, ${weight})`
                        context.beginPath();
                        context.moveTo(startPrevLayerPos + k * 100 + 50, (i - 1) * 100 + 50);
                        context.lineTo(startHorizontalPos + j * 100 + 50, i * 100 + 50);
                        context.lineWidth = Math.abs(weights[k]) * 2;
                        context.strokeStyle = weightRgb;
                        context.stroke();
                    }
                }
            }
        }

        for (let i = 0; i < network.length; i++) {
            const layer = network[i];
            const layerNeuronCount = layer.outputs.data.length;

            // Calculate horizontal start position
            const startHorizontalPos = (canvas.width - (layerNeuronCount * 100)) / 2;

            // Iterate over neurons in layer
            for (let j = 0; j < layer.outputs.data.length; j++) {
                const output = layer.outputs.data[j][0];

                // Draw neuron
                const bias = (sigmoid(layer.biases.data[j][0]) + 1) * 127;
                const biasRgb = `rgb(${bias}, ${bias}, ${bias})`
                context.beginPath();
                context.lineWidth = Math.abs(output * 10);
                context.arc(startHorizontalPos + j * 100 + 50, i * 100 + 50, 20, 0, 2 * Math.PI, false);
                context.strokeStyle = output > 0 ? "#0f0" : "#f00";
                context.stroke();
                context.fillStyle = biasRgb;
                context.fill();
            }
        }
    }, [network]);

    return (
        <canvas ref={canvasRef} />
    );
}

