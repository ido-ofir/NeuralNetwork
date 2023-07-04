import { Matrix } from './Matrix.mjs';

export class NeuralNetwork {
    constructor({inputs, layers, outputs, learningRate = 0.2}) {
        this.learningRate = learningRate;
        this.config = {inputs, layers, outputs}

        this.initialize()
    }

    initialize = () => {
        const {inputs, layers, outputs} = this.config
        const prevLayers = [inputs, ...layers];
        this.initialLayers = [...layers, outputs].map((layer, index) => {
            return {
                weights: new Matrix(layer, prevLayers[index]).randomize(),
                bias: new Matrix(layer, 1).randomize(),
            }
        })
        this.reset()
    }

    reset = () => {
        this.layers = this.initialLayers.map((layer, index) => {
            return {
                weights: new Matrix(layer.weights.rows, layer.weights.cols).map((_, i, j) => layer.weights.data[i][j]),
                bias: new Matrix(layer.bias.rows, layer.bias.cols).map((_, i, j) => layer.bias.data[i][j]),
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

        this.layers.forEach(({ weights, bias }) => {
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
                targets,
                outputs,
                accuracy: 1 - targets.reduce((total, target, index) => total + Math.abs(target - outputs.at(-1).data[index].at(-1)), 0) / targets.length
            }
        })
    }

    train(inputArray, targetArray) {
        // Feed forward
        const { outputs, input } = this.predict(inputArray)

        const prevOutputs = [input, ...outputs.slice(0, -1)]

        let outputErrors = Matrix.subtract(Matrix.fromArray(targetArray), outputs.at(-1))

        for (let i = outputs.length - 1; i >= 0; i--) {

            // Calculate gradient
            const gradients = outputs[i].map(this.dsigmoid);
            gradients.multiply(outputErrors);
            gradients.multiply(this.learningRate);
            
            // Calculate deltas
            const weights_deltas = Matrix.multiply(gradients, Matrix.transpose(prevOutputs[i]));
            
            // Adjust the weights by deltas
            this.layers[i].weights.add(weights_deltas)
            // Adjust the bias by its deltas
            this.layers[i].bias.add(gradients)

            // Prepare next outputErrors
            outputErrors = Matrix.multiply(Matrix.transpose(this.layers[i].weights), outputErrors);
        }
    }
}
