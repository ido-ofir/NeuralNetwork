import { Matrix } from './Matrix.mjs';

export class NeuralNetwork {
    constructor(inputNodes, hiddenNodes, outputNodes, learningRate = 0.2) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;
        this.learningRate = learningRate;

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

    predict(inputArray) {
        const inputs = Matrix.fromArray(inputArray);
        const hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        hidden.map(this.sigmoid);

        const outputs = Matrix.multiply(this.weights_ho, hidden);
        outputs.add(this.bias_o);
        outputs.map(this.sigmoid);

        return {
            inputs,
            hidden,
            outputs
        }
    }

    assess(data) {
        const result = data.map(({inputs, targets}) => {
            const { outputs, hidden } = this.predict(inputs)
            return {
                inputs,
                hidden,
                outputs: outputs.data,
                accuracy: 1 - targets.reduce((total, target, index) => total + Math.abs(target - outputs.data[index].at(-1)), 0) / targets.length
            }
        })

        return result
    }

    train(inputArray, targetArray) {
        // Feed forward
        const {
            inputs,
            hidden,
            outputs
        } = this.predict(inputArray)

        // Convert array to matrix object
        let targets = Matrix.fromArray(targetArray);

        // Calculate the error
        // ERROR = TARGETS - OUTPUTS
        let outputErrors = Matrix.subtract(targets, outputs);

        // let gradient = outputs * (1 - outputs);
        // Calculate gradient
        let gradients = outputs.map(this.dsigmoid);
        gradients.multiply(outputErrors);
        gradients.multiply(this.learningRate);

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
        let hiddenGradient = hidden.map(this.dsigmoid);
        hiddenGradient.multiply(hiddenErrors);
        hiddenGradient.multiply(this.learningRate);

        // Calcuate input->hidden deltas
        let inputsT = Matrix.transpose(inputs);
        let weights_ih_deltas = Matrix.multiply(hiddenGradient, inputsT);

        this.weights_ih.add(weights_ih_deltas);
        // Adjust the bias by its deltas
        this.bias_h.add(hiddenGradient);
    }
}
