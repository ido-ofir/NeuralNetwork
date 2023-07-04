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

const getOutputColor = (value) => `rgba(100, 100, 255, ${value})`

export const NeuralNetworkCanvas = ({ network, structureColor = "#aaa", backgroundColor = "#444", getValueColor = getOutputColor }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Determine size of canvas based on network size
        const layerCount = network.length;
        const maxNeuronCount = Math.max(...network.map((layer, i) => layer.length));
        canvas.height = layerCount * 100; // Space layers 100px apart vertically
        canvas.width = maxNeuronCount * 100 + 20; // Space neurons 100px apart horizontally
        context.clearRect(0, 0, canvas.width, canvas.height);
        const links = []
        const nodes = []
        // Iterate over layers
        for (let i = 0; i < network.length; i++) {
            const layer = network[i];
            const layerNeuronCount = layer.length;

            // Calculate horizontal start position
            const startHorizontalPos = (canvas.width - (layerNeuronCount * 100)) / 2 + 20;

            // Iterate over neurons in layer
            for (let j = 0; j < layer.length; j++) {
                const neuron = layer[j];
                const layerIndex = i;
                const neuronIndex = j;
                const outputRgb = getValueColor(neuron.output)
                links.push(() => {
                    // Draw weights
                    if (layerIndex > 0) {
                        // If not the first layer, draw weights
                        const prevLayer = network[layerIndex - 1];
                        const prevLayerNeuronCount = prevLayer.length;
                        const startPrevLayerPos = (canvas.width - (prevLayerNeuronCount * 100)) / 2 + 20;

                        for (let k = 0; k < prevLayer.length; k++) {

                            const prevNeuron = prevLayer[k];
                            context.beginPath();
                            context.lineCap = "round";
                            context.lineWidth = Math.abs(neuron.weights[k]) * 4 + 4;
                            context.moveTo(startPrevLayerPos + k * 100 + 50, (layerIndex - 1) * 100 + 50);
                            context.lineTo(startHorizontalPos + neuronIndex * 100 + 50, layerIndex * 100 + 50);
                            context.strokeStyle = neuron.weights[k] > 0 ? structureColor : '#f00';
                            context.stroke();
                            context.lineWidth = Math.abs(neuron.weights[k]) * 4;
                            context.strokeStyle = backgroundColor;
                            context.stroke();
                            context.strokeStyle = neuron.weights[k] > 0 ? `rgba(100, 100, 255, ${prevNeuron.output})` : `rgba(155, 0, 0, ${prevNeuron.output})`;
                            context.stroke();
                        }
                    }
                })

                nodes.push(() => {
                    // Draw neurons with bias as the size of the neuron, and color as output
                    context.beginPath();
                    context.lineWidth = 4;
                    context.arc(startHorizontalPos + neuronIndex * 100 + 50, layerIndex * 100 + 50, sigmoid(neuron.bias) * 30, 0, 2 * Math.PI, false);
                    context.strokeStyle = neuron.bias >= 0 ? structureColor : "#f00";
                    context.stroke();
                    context.fillStyle = backgroundColor;
                    context.fill();
                    context.fillStyle = outputRgb;
                    context.fill();
                    context.beginPath();
                    context.rect(startHorizontalPos + neuronIndex * 100 - 10, layerIndex * 100 + 40, 40, 20);
                    context.fillStyle = "#222";
                    context.fill();
                    context.lineWidth = 1;
                    context.stroke();
                    context.font = "16px serif";
                    context.textAlign = "center";
                    context.fillStyle = '#fff';
                    context.textBaseline = 'middle';
                    context.fillText(neuron.output.toFixed(2), startHorizontalPos + neuronIndex * 100 + 10, layerIndex * 100 + 50)
                })

            }
        }

        links.map(t => t())
        nodes.map(t => t())
    }, [network]);

    return (
        <canvas ref={canvasRef} />
    );
}

