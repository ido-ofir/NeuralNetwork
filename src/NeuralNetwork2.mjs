import { Matrix } from './Matrix.mjs';

export class NeuralNetwork {
    constructor(inputNodes, structure, learningRate = 0.2) {
        this.learningRate = learningRate;
        this.network = structure.map((layer, index) => {
            return {
                weights: new Matrix(layer, index ? structure[index - 1] : inputNodes).randomize(),
                bias: new Matrix(layer, 1).randomize(),
            }
        })
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
        const input = Matrix.fromArray(inputArray);

        const outputs = [input]

        this.network.forEach(({ weights, bias }) => {
            const output = Matrix.multiply(weights, outputs.at(-1));
            output.add(bias);
            output.map(this.sigmoid);
            outputs.push(output)
        })

        return {
            input,
            outputs: outputs.slice(1),
        }
    }

    assess(data) {
        return data.map(({inputs, targets}) => {
            const { outputs } = this.predict(inputs)
            return {
                inputs,
                outputs,
                accuracy: 1 - targets.reduce((total, target, index) => total + Math.abs(target - outputs.at(-1).data[index].at(-1)), 0) / targets.length
            }
        })
    }

    train(inputArray, targetArray) {
        // Feed forward
        const { outputs, input } = this.predict(inputArray)

        let outputErrors
        for (let i = outputs.length - 1; i >= 0; i--) {

            if (i === outputs.length - 1) {
                outputErrors = Matrix.subtract(Matrix.fromArray(targetArray), outputs[i]);
            }
            else {
                outputErrors = Matrix.multiply(Matrix.transpose(this.network[i + 1].weights), outputErrors);
            }
            // Calculate gradient
            let gradients = outputs[i].map(this.dsigmoid);
            gradients.multiply(outputErrors);
            gradients.multiply(this.learningRate);

            // Calculate deltas
            let weights_deltas = Matrix.multiply(gradients, Matrix.transpose(i === 0 ? input : outputs[i - 1]));

            // Adjust the weights by deltas
            this.network[i].weights.add(weights_deltas)
            // Adjust the bias by its deltas
            this.network[i].bias.add(gradients)
        }
    }
}
