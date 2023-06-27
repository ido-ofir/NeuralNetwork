import React, { useState, useRef, useMemo, useReducer } from 'react'
import { NeuralNetworkCanvas } from './NeuralNetworkCanvas'
import { NeuralNetwork } from './NeuralNetwork2'


// function sigmoid(x) {
//     return 1 / (1 + Math.exp(-x));
// }

// function sigmoidDerivative(x) {
//     const fx = sigmoid(x);
//     return fx * (1 - fx);
// }


// class Neuron {
//     constructor(numOfInputs) {
//         this.weights = Array.from(
//             { length: numOfInputs },
//             () => Math.random() * 2 - 1
//         );
//         this.bias = Math.random() * 2 - 1;
//     }

//     feedforward(inputs) {
//         let total = 0;
//         for (let i = 0; i < inputs.length; i++) {
//             total += this.weights[i] * inputs[i];
//         }
//         total += this.bias;
//         this.output = sigmoid(total);
//         return this.output;
//     }
// }

// class MLP {
//     constructor(layers) {
//         let numInputs = layers.shift()
//         this.layers = layers.map(l => {
//             const layer = Array.from({ length: l }, () => new Neuron(numInputs))
//             numInputs = l
//             return layer
//         })
//         this.hidden = [new Neuron(1)];
//         this.output = new Neuron(1);
//     }

//     feedforward(inputs) {
//         let outputs = inputs
//         this.layers.map(layer => {
//             outputs = layer.map(n => n.feedforward(outputs))
//         })
//         return outputs;
//     }

//     neuronFeedforward(neuron, inputs) {
//         let total = 0;
//         const [weights, bias] = neuron
//         for (let i = 0; i < inputs.length; i++) {
//             total += weights[i] * inputs[i];
//         }
//         total += bias;
//         return sigmoid(total);
//     }

//     train(inputs, targets, epochs, lr) {
//         for (let e = 0; e < epochs; e++) {
//             for (let i = 0; i < inputs.length; i++) {
//                 const outputs = this.feedforward(inputs[i]);
//                 const error = output.map((t, k) => targets[i][k] - t);

//                 for (let l = this.layers.length - 1; l >= 0; l--) {
//                     const layer = this.layers[l];
//                     let gradients = Matrix.map(outputs[i + 1], this.dsigmoid);
//                     gradients.multiply(error);
//                     gradients.multiply(this.learningRate);

//                     // Calculate deltas
//                     let previousOutputsT = Matrix.transpose(i > 0 ? layerOutputs[i] : layerOutputs[0]);
//                     let deltas = Matrix.multiply(gradients, previousOutputsT);

//                     // Adjust weights and biases
//                     this.layers[i].weights.add(deltas);
//                     this.layers[i].biases.add(gradients);

//                     // Calculate next error
//                     let weightsT = Matrix.transpose(this.layers[i].weights);
//                     error = Matrix.multiply(weightsT, error);
//                 }

//                 outputs.map((output, k) => {
//                     const error = targets[i][k] - output;
//                     const outputDirevative = sigmoidDerivative(output);
//                     const outputWeights = this.output.weights;
//                 })


//                 for (let j = 0; j < this.hidden.length; j++) {
//                     const hiddenDirevative = sigmoidDerivative(hiddenOut[j]);
//                     const factor = error * hiddenDirevative * outputDirevative;
//                     const hidden = this.hidden[j];
//                     for (let k = 0; k < hidden.weights.length; k++) {
//                         const inputVal = inputs[i][k];
//                         hidden.weights[k] =
//                             hidden.weights[k] + factor * outputWeights[j] * inputVal * lr;
//                     }
//                     hidden.bias = hidden.bias + factor * outputWeights[j] * lr;
//                 }

//                 for (let j = 0; j < outputWeights.length; j++) {
//                     outputWeights[j] +=
//                         error * sigmoidDerivative(output) * hiddenOut[j] * lr;
//                 }
//                 this.output.bias += error * sigmoidDerivative(output) * lr;
//             }
//         }
//     }
// }

// let inputs = [
//     [0],
//     [1],
//     // [1, 0],
//     // [1, 1],
// ]; // inputs for XOR gate
// let targets = [[1], [0]]; // targets for XOR gate
// const random = () => Math.random() * 2 - 1
// const neuron = (numWeights) => [Array.from({ length: numWeights }, random), random()]
// const layer = (length, prevLayerLength) => Array.from({ length }, () => neuron(prevLayerLength))

// let mlp = new MLP([
//     1,
//     1,
//     1,
// ]);

// let outputValue = mlp.feedforward(inputs[0])[0].toFixed(2)

// console.log(outputValue)

const inputs = 2
const outputs = 2
const hiddenLayer = 2

const data = [
    {
        inputs: [0, 1],
        targets: [1, 0],
    },
    {
        inputs: [1, 0],
        targets: [0, 1],
    }
]
const useML = ({inputs = 1, hiddenLayer = 1, outputs = 1, stepInterval = 100, learningRate = 100} = {}) => {
    const intervalRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [stepsCount, step] = useReducer(stepsCount => stepsCount + 1, 0)
    const [output, setOutput] = useState([])
    const [neuralNetwork] = useState(() => new NeuralNetwork(inputs, hiddenLayer, outputs))

    useMemo(() => isPlaying ? intervalRef.current = setInterval(step, stepInterval) : clearInterval(intervalRef.current), [isPlaying])

    const train = (epochs) => {
        for (let i = 0; i < epochs; i++) {
            data.map(({inputs, targets}) => neuralNetwork.train(inputs, targets))
        }
        step()
    }

    useMemo(() => {
        data.map(({inputs, targets}) => neuralNetwork.train(inputs, targets))
        const output = neuralNetwork.assess(data)
        setOutput(output)
    }, [stepsCount])

    return {
        play: () => setIsPlaying(true),
        stop: () => setIsPlaying(false),
        step,
        isPlaying,
        stepsCount,
        output,
        train,
    }
}

const App = () => {
    const { 
        play,
        stop,
        step,
        isPlaying,
        stepsCount,
        output,
        train,
     } = useML({inputs, hiddenLayer, outputs})

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#888' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                <div style={{ width: 500, height: 200, border: '1px solid black' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                        {
                            output.map((t, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                        <div>Input = </div>
                                        {
                                            JSON.stringify(t.inputs.map(t => t.toFixed(2)))
                                        }
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                        <div>Output = </div>
                                        {
                                            JSON.stringify(t.outputs.map(t => t.map(w => w.toFixed(2))))
                                        }
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                        <span>Accuracy = </span>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>{t.accuracy.toFixed(2)}</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    {/* <div>
                        {
                            mlp.layers.map((layer, i) => (
                                <div key={i} style={{}}>
                                    {
                                        layer.map(t => (
                                            <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                                {t.weights.map((w, i) => (
                                                    <div key={i}>{w.toFixed(2)}</div>
                                                ))}
                                            </div>
                                        ))
                                    }
                                    {
                                        layer.map(t => (
                                            <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                                <div>{t.bias.toFixed(2)}</div>
                                                <div>{t.output.toFixed(2)}</div>
                                            </div>
                                        ))
                                    }
                                </div>
                            ))
                        }

                    </div> */}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
                    <div style={{}}>
                        {/* <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', fontSize: '2rem' }}>
                            <div>{input[0]}</div>
                        </div> */}
                        {/* <NeuralNetworkCanvas network={[new Array(input).map(n => ({ bias: n, output: n })), [this.weights_ih], [neuralNetwork.output]]} /> */}
                    </div>
                    {/* <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', fontSize: '2rem' }}>
                        <div>{output}</div>
                    </div> */}
                    <div>
                        <div>
                            <button onClick={step}>
                                Step
                            </button>
                            <button onClick={isPlaying ? stop : play}>
                                {isPlaying ? 'Stop' : 'Play'}
                            </button>
                            <button onClick={() => train(10000)}>
                                10,000 epochs
                            </button>
                            <button onClick={() => train(100000)}>
                                100,000 epochs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
