import { Matrix } from './Matrix copy.mjs';

export class NeuralNetwork {
    constructor({inputs, layers, outputs, learningRate = 0.2}) {
        this.learningRate = learningRate;
        this.config = {inputs, layers, outputs}
        this.outputErrors = []

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

    removeNode = (layer, index) => {
        if (layer === this.layers.length - 1) throw `Node at layer ${layer} cannot be removed`

        this.layers[layer].weights.removeRow(index)
        this.layers[layer].bias.removeRow(index)
        this.layers[layer + 1].weights.removeCol(index)
    }

    addNode = (layer) => {
        if (layer === this.layers.length - 1) throw `Node at layer ${layer} cannot be added`

        this.layers[layer].weights.addRow()
        this.layers[layer].bias.addRow()
        this.layers[layer + 1].weights.addCol()
    }

    // Define the activation function and its derivative
    sigmoid = (x) => {
        return 1 / (1 + Math.exp(-x));
    }

    dsigmoid = (y) => {
        // y is already sigmoided
        return y * (1 - y);
    }

    unsigmoid = (y) => {
        return Math.log(y/(1-y))
    }

    xsigmoid = (x) => {
        return 1 - 2 / (Math.exp(x) + Math.exp(-x));
    }

    predict  = (inputArray) => {
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

    assess = (data) => {
        return data.map(({inputs, targets}) => {
            const { outputs, input } = this.predict(inputs)
            return {
                input,
                inputs,
                targets,
                outputs,
                accuracy: 1 - targets.reduce((total, target, index) => total + Math.abs(target - outputs.at(-1).data[index].at(-1)), 0) / targets.length
            }
        })
    }

    train = (data) => {
        const outputErrors = []
        data.forEach(({inputs, targets}) => {
            // Feed forward
            const [{ outputs, input, accuracy }] = this.assess([{inputs, targets}])
    
            const prevOutputs = [input, ...outputs.slice(0, -1)]
    
            this.outputErrors = [Matrix.subtract(Matrix.fromArray(targets), outputs.at(-1))]
    
            for (let i = outputs.length - 1; i >= 0; i--) {
    
                // Calculate gradient
                const gradients = Matrix.map(outputs[i], this.dsigmoid);
                gradients.multiply(this.outputErrors[0]);
                gradients.multiply(this.learningRate / accuracy);
                
                // Calculate deltas
                const weights_deltas = Matrix.multiply(gradients, Matrix.transpose(prevOutputs[i]));
                
                // Adjust the weights by deltas
                this.layers[i].weights.add(weights_deltas)
                // Adjust the bias by its deltas
                this.layers[i].bias.add(gradients)
    
                // Prepare next outputErrors
                this.outputErrors.unshift(Matrix.multiply(Matrix.transpose(this.layers[i].weights), this.outputErrors[0]))
            }

            outputErrors.push(this.outputErrors)
        })
        neuralNetwork.adjustLayers(data, outputErrors)
    }

    adjustLayers = (data, outputErrors) => {
        const assessment = this.assess(data)

        let layersToAddNodesTo = []
        const xresults = []

        assessment.forEach(({ inputs, targets, outputs, accuracy }, i) => {
            outputs.slice(0, -1).forEach((output, j) => {
                if(!xresults[j]) xresults.push([])
                output.data.forEach(([outputValue], k) => {
                    const changeHardness = 1 - this.dsigmoid(outputValue) * 2
                    const errorRate = neuralNetwork.xsigmoid(outputErrors[i][j + 1].data[k][0])

                    xresults[j].push({
                        changeHardness,
                        errorRate,
                        accuracy
                    })
                })
            })
        })

        const estimatedAccuracyPerLayer = xresults.map((b) => 1 - b.reduce((c, d) => c + d['errorRate'], 0) / b.length)
        const estimatedChangeHardnessPerLayer = xresults.map((b) => b.reduce((c, d) => c + d['changeHardness'], 0) / b.length)

        const accuracy = assessment.reduce((a, b) => a + b.accuracy, 0) / assessment.length
        
        if(neuralNetwork.unsigmoid(estimatedChangeHardnessPerLayer.reduce((a, b) => a + b, 0) / estimatedChangeHardnessPerLayer.length) > 1) {
            estimatedChangeHardnessPerLayer.forEach((estimatedChangeHardness, layer) => {
                if(neuralNetwork.unsigmoid(estimatedChangeHardness) <= 1) return
                if(neuralNetwork.unsigmoid(estimatedAccuracyPerLayer[layer]) > accuracy) return

                layersToAddNodesTo.push(layer)
            })

        }

        layersToAddNodesTo.forEach(layer => this.addNode(layer))
    }
}