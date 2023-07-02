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
        const inputs = Matrix.fromArray(inputArray);

        const result = [inputs]

        this.network.forEach(({ weights, bias }) => {
            const outputs = Matrix.multiply(weights, result.at(-1));
            outputs.add(bias);
            outputs.map(this.sigmoid);
            result.push(outputs)
        })

        return {
            inputs: result.at(0),
            outputs: result.at(-1),
            result,
        }
    }

    assess(data) {
        const result = data.map(({inputs, targets}) => {
            const { outputs, result } = this.predict(inputs)
            return {
                inputs,
                result,
                outputs: outputs.data,
                accuracy: 1 - targets.reduce((total, target, index) => total + Math.abs(target - outputs.data[index].at(-1)), 0) / targets.length
            }
        })

        return result
    }

    train(inputArray, targetArray) {
        // Feed forward
        const { result } = this.predict(inputArray)

        let outputErrors
        for (let i = result.length - 1; i >= 1; i--) {

            if (i === result.length - 1) {
                outputErrors = Matrix.subtract(Matrix.fromArray(targetArray), result[i]);
            }
            else {
                outputErrors = Matrix.multiply(Matrix.transpose(this.network[i].weights), outputErrors);
            }
            // Calculate gradient
            let gradients = result[i].map(this.dsigmoid);
            gradients.multiply(outputErrors);
            gradients.multiply(this.learningRate);

            // Calculate deltas
            let weights_deltas = Matrix.multiply(gradients, Matrix.transpose(result[i - 1]));

            // Adjust the weights by deltas
            this.network[i - 1].weights.add(weights_deltas)
            // Adjust the bias by its deltas
            this.network[i - 1].bias.add(gradients)
        }
    }
}
