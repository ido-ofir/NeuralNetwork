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
        const maxNeuronCount = Math.max(...network.map((layer, i) => layer.length));
        canvas.height = layerCount * 100; // Space layers 100px apart vertically
        canvas.width = maxNeuronCount * 100; // Space neurons 100px apart horizontally
        context.clearRect(0, 0, canvas.width, canvas.height);
        const structure = []
        const output = []
        // Iterate over layers
        for (let i = 0; i < network.length; i++) {
            const layer = network[i];
            const layerNeuronCount = layer.length;

            // Calculate horizontal start position
            const startHorizontalPos = (canvas.width - (layerNeuronCount * 100)) / 2;

            // Iterate over neurons in layer
            for (let j = 0; j < layer.length; j++) {
                const neuron = layer[j];
                const layerIndex = i;
                const neuronIndex = j;
                structure.unshift(() => {
                    // Draw weights
                    if (layerIndex > 0) {
                        // If not the first layer, draw weights
                        const prevLayer = network[layerIndex - 1];
                        const prevLayerNeuronCount = prevLayer.length;
                        const startPrevLayerPos = (canvas.width - (prevLayerNeuronCount * 100)) / 2;

                        for (let k = 0; k < prevLayer.length; k++) {

                            const weight = sigmoid(neuron.weights[k]) * 255;
                            const weightRgb = `rgb(${weight}, ${weight}, ${weight})`
                            context.beginPath();
                            context.moveTo(startPrevLayerPos + k * 100 + 50, (layerIndex - 1) * 100 + 50);
                            context.lineWidth = Math.abs(neuron.weights[k]) * 4;
                            context.lineTo(startHorizontalPos + neuronIndex * 100 + 50, layerIndex * 100 + 50);
                            context.strokeStyle = weightRgb;
                            context.stroke();
                        }
                    }
                })

                structure.push(() => {
                    // Draw neurons with bias as the size of the neuron
                    const bias = 126 + sigmoid(neuron.bias) * 126;
                    const biasRgb = `rgb(${bias}, ${bias}, ${bias})`
                    context.beginPath();
                    context.lineWidth = Math.abs(neuron.output * 10);
                    context.arc(startHorizontalPos + neuronIndex * 100 + 50, layerIndex * 100 + 50, sigmoid(neuron.bias) * 30, 0, 2 * Math.PI, false);
                    // context.strokeStyle = neuron.output > 0 ? "#0f0" : "#f00";
                    // context.stroke();
                    context.fillStyle = biasRgb;
                    context.fill();
                })
                output.push(() => {
                    // Draw neuron output
                    const outputRgb = `rgba(100, 100, 255, ${neuron.output})`
                    context.beginPath();
                    context.lineWidth = Math.abs(neuron.output * 4);
                    context.arc(startHorizontalPos + neuronIndex * 100 + 50, layerIndex * 100 + 50, 14, 0, 2 * Math.PI, false);
                    // context.strokeStyle = neuron.output > 0 ? "#0f0" : "#f00";
                    // context.stroke();
                    context.fillStyle = outputRgb;
                    context.fill();

                    if (layerIndex > 0) {
                        const prevLayer = network[layerIndex - 1];
                        const prevLayerNeuronCount = prevLayer.length;
                        const startPrevLayerPos = (canvas.width - (prevLayerNeuronCount * 100)) / 2;

                        for (let k = 0; k < prevLayer.length; k++) {
                            const output = sigmoid(neuron.weights[k] * prevLayer[k].output);
                            context.beginPath();
                            context.moveTo(startPrevLayerPos + k * 100 + 50, (layerIndex - 1) * 100 + 50);
                            context.lineWidth = Math.abs(neuron.weights[k]) * 2;
                            context.lineTo(startHorizontalPos + neuronIndex * 100 + 50, layerIndex * 100 + 50);
                            const strokeStyle = `rgba(100, 100, 255, ${output})`
                            context.strokeStyle = strokeStyle;
                            context.stroke();
                        }
                    }
                })

            }
        }

        structure.map(t => t())
        output.map(t => t())
    }, [network]);

    return (
        <canvas ref={canvasRef} />
    );
}

