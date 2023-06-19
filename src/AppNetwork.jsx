import React, { useState, useRef } from 'react'
import NeuralNetworkCanvas from './NeuralNetworkCanvas'


function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function sigmoidDerivative(x) {
  const fx = sigmoid(x);
  return fx * (1 - fx);
}

function getNeuronOutput(neuron, inputs) {
  let total = 0;
  const [weights, bias] = neuron
  for (let i = 0; i < inputs.length; i++) {
    total += weights[i] * inputs[i];
  }
  total += bias;
  return sigmoid(total);
}

function getNetworkOutputs(network) {
  let outputs = network[0]
  for (let q = 1; q < network.length; q++) {
    outputs = network[q].map(neuron => getNeuronOutput(neuron, outputs))
  }
  return outputs;
}

function getNetworkOutputsStack(network) {
  let outputs = network[0]
  const stack = []
  for (let q = 1; q < network.length; q++) {
    outputs = network[q].map(neuron => getNeuronOutput(neuron, outputs))
    stack.push(outputs)
  }
  return stack;
}

function trainNetwork(network, inputs, targets, epochs, learningRate){
  for (let e = 0; e < epochs; e++) {
    for (let i = 0; i < inputs.length; i++) {
      network[0][i] = inputs[i]
      const outputs = getNetworkOutputs(network)
      outputs.map((output, io) => {
        const error = targets[i][io] - output;
        const outputDirevative = sigmoidDerivative(output);
        for (let q = 1; q < network.length; q++) {
          const layer = network[q]
          for (let j = 0; j < layer.length; j++) {
            const layerDirevative = sigmoidDerivative(layer[j]);
            const factor = error * layerDirevative * outputDirevative;
            const hidden = this.hidden[j];
            for (let k = 0; k < hidden.weights.length; k++) {
              const inputVal = inputs[i][k];
              hidden.weights[k] =
                hidden.weights[k] + factor * outputWeights[j] * inputVal * learningRate;
            }
            hidden.bias = hidden.bias + factor * outputWeights[j] * learningRate;
          }
        }
      })
      for (let q = 1; q < this.layers.length; q++) {
        const hiddenDirevative = sigmoidDerivative(hiddenOut[j]);
        const factor = error * hiddenDirevative * outputDirevative;
        const hidden = this.hidden[j];
        for (let k = 0; k < hidden.weights.length; k++) {
          const inputVal = inputs[i][k];
          hidden.weights[k] =
            hidden.weights[k] + factor * outputWeights[j] * inputVal * learningRate;
        }
        hidden.bias = hidden.bias + factor * outputWeights[j] * learningRate;
      }
      const hiddenOut = this.hidden.map((n) => n.feedforward(inputs[i]));
      const output = this.output.feedforward(hiddenOut);
      const outputDirevative = sigmoidDerivative(output);
      const outputWeights = this.output.weights;

      for (let j = 0; j < this.hidden.length; j++) {
        const hiddenDirevative = sigmoidDerivative(hiddenOut[j]);
        const factor = error * hiddenDirevative * outputDirevative;
        const hidden = this.hidden[j];
        for (let k = 0; k < hidden.weights.length; k++) {
          const inputVal = inputs[i][k];
          hidden.weights[k] =
            hidden.weights[k] + factor * outputWeights[j] * inputVal * learningRate;
        }
        hidden.bias = hidden.bias + factor * outputWeights[j] * learningRate;
      }

      for (let j = 0; j < outputWeights.length; j++) {
        outputWeights[j] +=
          error * sigmoidDerivative(output) * hiddenOut[j] * learningRate;
      }
      this.output.bias += error * sigmoidDerivative(output) * learningRate;
    }
  }
}

class MLP {
  constructor(layers) {
    this.layers = layers
  }

  feedforward(inputs) {
    let outputs = inputs
    this.layers[0].map((layer, i) => {
        layer[1] = outputs[i]
    })
    for (let q = 1; q < this.layers.length; q++) {
      outputs = this.layers[q].map(neuron => getNeuronOutput(neuron, outputs))
    }
    return outputs;
  }

  train(inputs, targets, epochs, lr) {
    for (let e = 0; e < epochs; e++) {
      for (let i = 0; i < inputs.length; i++) {
        this.layers[0][i][1] = inputs[i]
        const outputs = this.feedforward(inputs)
        const error = targets[i] - outputs[0];
        for (let q = 1; q < this.layers.length; q++) {
          const hiddenDirevative = sigmoidDerivative(hiddenOut[j]);
          const factor = error * hiddenDirevative * outputDirevative;
          const hidden = this.hidden[j];
          for (let k = 0; k < hidden.weights.length; k++) {
            const inputVal = inputs[i][k];
            hidden.weights[k] =
              hidden.weights[k] + factor * outputWeights[j] * inputVal * lr;
          }
          hidden.bias = hidden.bias + factor * outputWeights[j] * lr;
        }
        const hiddenOut = this.hidden.map((n) => n.feedforward(inputs[i]));
        const output = this.output.feedforward(hiddenOut);
        const outputDirevative = sigmoidDerivative(output);
        const outputWeights = this.output.weights;

        for (let j = 0; j < this.hidden.length; j++) {
          const hiddenDirevative = sigmoidDerivative(hiddenOut[j]);
          const factor = error * hiddenDirevative * outputDirevative;
          const hidden = this.hidden[j];
          for (let k = 0; k < hidden.weights.length; k++) {
            const inputVal = inputs[i][k];
            hidden.weights[k] =
              hidden.weights[k] + factor * outputWeights[j] * inputVal * lr;
          }
          hidden.bias = hidden.bias + factor * outputWeights[j] * lr;
        }

        for (let j = 0; j < outputWeights.length; j++) {
          outputWeights[j] +=
            error * sigmoidDerivative(output) * hiddenOut[j] * lr;
        }
        this.output.bias += error * sigmoidDerivative(output) * lr;
      }
    }
  }
}

let inputs = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
]; // inputs for XOR gate
let targets = [0, 1, 1, 0]; // targets for XOR gate
const random = () => Math.random() * 2 - 1
const neuron = (numWeights) => [Array.from({ length: numWeights }, random), random()]
const layer = (length, prevLayerLength) => Array.from({ length }, () => neuron(prevLayerLength))
const network = [
  [0, 0],
  layer(4, 2),
  layer(1, 4),
]
let mlp = new MLP([
  [0, 0],
  layer(4, 2),
  layer(1, 4),
]);

const App = () => {
  const [result, setResults] = useState(inputs.map(i => mlp.feedforward(i)[0].toFixed(2)))
  const index = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const interval = useRef(null)
  const step = () => {
    let i = index.current + 1
    if (i >= inputs.length){
      i = 0
    }
    const input = inputs[i]
    const target = targets[i]
    mlp.train([input], [target], 1, 0.2);
    setResults(inputs.map(i => mlp.feedforward(i)[0].toFixed(2)))
    index.current = i
  }
  const play = () => {
    setIsPlaying(true)
    interval.current = setInterval(step, 100)
  }
  const stop = () => {
    setIsPlaying(false)
    clearInterval(interval.current)
  }
  const input = inputs[index.current]
  const target = targets[index.current]

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#888' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 20 }}>
        <NeuralNetworkCanvas network={[input.map(n => ({ bias: n })), mlp.hidden,[mlp.output]]}/>
        </div>
        <div>
          {
            result.map((r, i) => <div key={i}>{r}</div>)
          }
          <div>
            <button onClick={step}>
              Step
            </button>
            <button onClick={play}>
              Play
            </button>
            <button onClick={stop}>
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
