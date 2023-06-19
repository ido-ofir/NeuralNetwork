import { Matrix } from './Matrix.mjs';

export class NeuralNetwork {
    constructor(inputNodes, hiddenNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;

        // Initialize weights and biases
        this.weights_ih = new Matrix(this.hiddenNodes, this.inputNodes).randomize();
        this.weights_ho = new Matrix(this.outputNodes, this.hiddenNodes).randomize();
        this.bias_h = new Matrix(this.hiddenNodes, 1).randomize();
        this.bias_o = new Matrix(this.outputNodes, 1).randomize();
    }

    // Define the activation function and its derivative
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    dsigmoid(y) {
        // y is already sigmoided
        return y * (1 - y);
    }

    train(inputArray, targetArray) {
        // Feed forward
        let inputs = Matrix.fromArray(inputArray);
        let hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        hidden.map(this.sigmoid);

        let outputs = Matrix.multiply(this.weights_ho, hidden);
        outputs.add(this.bias_o);
        outputs.map(this.sigmoid);

        // Convert array to matrix object
        let targets = Matrix.fromArray(targetArray);

        // Calculate the error
        // ERROR = TARGETS - OUTPUTS
        let outputErrors = Matrix.subtract(targets, outputs);

        // let gradient = outputs * (1 - outputs);
        // Calculate gradient
        let gradients = Matrix.map(outputs, this.dsigmoid);
        gradients.multiply(outputErrors);
        gradients.multiply(learning_rate);

        // Calculate deltas
        let hiddenT = Matrix.transpose(hidden);
        let weights_ho_deltas = Matrix.multiply(gradients, hiddenT);

        // Adjust the weights by deltas
        this.weights_ho.add(weights_ho_deltas);
        // Adjust the bias by its deltas
        this.bias_o.add(gradients);

        // Calculate the hidden layer errors
        let weights_ho_t = Matrix.transpose(this.weights_ho);
        let hiddenErrors = Matrix.multiply(weights_ho_t, outputErrors);

        // Calculate hidden gradient
        let hiddenGradient = Matrix.map(hidden, this.dsigmoid);
        hiddenGradient.multiply(hiddenErrors);
        hiddenGradient.multiply(learning_rate);

        // Calcuate input->hidden deltas
        let inputsT = Matrix.transpose(inputs);
        let weights_ih_deltas = Matrix.multiply(hiddenGradient, inputsT);

        this.weights_ih.add(weights_ih_deltas);
        // Adjust the bias by its deltas
        this.bias_h.add(hiddenGradient);
    }
}
