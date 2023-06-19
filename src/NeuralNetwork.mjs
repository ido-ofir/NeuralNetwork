class Layer {
    constructor(nodeCount, previousNodeCount) {
        this.weights = new Matrix(nodeCount, previousNodeCount).randomize();
        this.biases = new Matrix(nodeCount, 1).randomize();
    }
}

export class NeuralNetwork {
    constructor(layerNodeCounts) {
        this.layers = [];

        // Generate the layers
        for(let i = 0; i < layerNodeCounts.length; i++) {
            let previousNodeCount = i > 0 ? layerNodeCounts[i - 1] : 0;
            this.layers.push(new Layer(layerNodeCounts[i], previousNodeCount));
        }
    }

    // Activation function and its derivative
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    dsigmoid(y) {
        // y is already sigmoided
        return y * (1 - y);
    }

    get() {
        // y is already sigmoided
        return this.layers.map(layer => []);
    }

    train(inputArray, targetArray) {
        // Feed forward
        let inputs = Matrix.fromArray(inputArray);
        let outputs = inputs;

        // Outputs from each layer
        let layerOutputs = [outputs];
        for(let i = 0; i < this.layers.length; i++) {
            outputs = Matrix.multiply(this.layers[i].weights, outputs);
            outputs.add(this.layers[i].biases);
            outputs.map(this.sigmoid);

            layerOutputs.push(outputs);
        }

        // Convert array to matrix object
        let targets = Matrix.fromArray(targetArray);
        let error = Matrix.subtract(targets, outputs);

        // Backpropagation
        for(let i = this.layers.length - 1; i >= 0; i--) {
            let gradients = Matrix.map(layerOutputs[i + 1], this.dsigmoid);
            gradients.multiply(error);
            gradients.multiply(this.learningRate);

            // Calculate deltas
            let previousOutputsT = Matrix.transpose(i > 0 ? layerOutputs[i] : layerOutputs[0]);
            let deltas = Matrix.multiply(gradients, previousOutputsT);

            // Adjust weights and biases
            this.layers[i].weights.add(deltas);
            this.layers[i].biases.add(gradients);

            // Calculate next error
            let weightsT = Matrix.transpose(this.layers[i].weights);
            error = Matrix.multiply(weightsT, error);
        }
    }
}
