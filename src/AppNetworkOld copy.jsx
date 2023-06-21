import React, { useState, useRef } from 'react'
import { NeuralNetworkCanvas } from './NeuralNetworkCanvas'


function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function sigmoidDerivative(x) {
  const fx = sigmoid(x);
  return fx * (1 - fx);
}


class Neuron {
  constructor(numOfInputs) {
    this.weights = Array.from(
      { length: numOfInputs },
      () => Math.random() * 2 - 1
    );
    this.bias = Math.random() * 2 - 1;
  }

  feedforward(inputs) {
    let total = 0;
    for (let i = 0; i < inputs.length; i++) {
      total += this.weights[i] * inputs[i];
    }
    total += this.bias;
    this.output = sigmoid(total);
    return this.output;
  }
}

class MLP {
  constructor(layers) {
    this.layers = layers
    this.hidden = [new Neuron(1)];
    this.output = new Neuron(1);
  }

  feedforward(inputs) {
    const hiddenOut = this.hidden.map(n => n.feedforward(inputs));
    const output = this.output.feedforward(hiddenOut)
    return output;
  }

  neuronFeedforward(neuron, inputs) {
    let total = 0;
    const [weights, bias] = neuron
    for (let i = 0; i < inputs.length; i++) {
      total += weights[i] * inputs[i];
    }
    total += bias;
    return sigmoid(total);
  }

  train(inputs, targets, epochs, lr) {
    for (let e = 0; e < epochs; e++) {
      for (let i = 0; i < inputs.length; i++) {
          const hiddenOut = this.hidden.map((n) => n.feedforward(inputs[i]));
          const output = this.output.feedforward(hiddenOut);
          const error = targets[i] - output;
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
  [0],
  [1],
  // [1, 0],
  // [1, 1],
]; // inputs for XOR gate
let targets = [1, 0]; // targets for XOR gate
const random = () => Math.random() * 2 - 1
const neuron = (numWeights) => [Array.from({ length: numWeights }, random), random()]
const layer = (length, prevLayerLength) => Array.from({ length }, () => neuron(prevLayerLength))

let mlp = new MLP([
  layer(2, 0),
  layer(2, 2),
  layer(1, 2),  
]);

const App = () => {
  const index = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [output, setOutput] = useState(mlp.feedforward(inputs[index.current]).toFixed(2))
  const [stepsCount, setStepsCount] = useState(0)
  const interval = useRef(null)
  const input = inputs[index.current]
  const target = targets[index.current]
  const step = () => {
    let i = index.current + 1
    if (i >= inputs.length){
      i = 0
    }
    const input = inputs[i]
    const target = targets[i]
    mlp.train([input], [target], 1, 0.2);
    setOutput(mlp.feedforward(inputs[i]).toFixed(2))
    index.current = i
    setStepsCount(stepsCount + 1)
  }
  const play = () => {
    setIsPlaying(true)
    interval.current = setInterval(step, 100)
  }
  const stop = () => {
    setIsPlaying(false)
    clearInterval(interval.current)
  }

  const train = (epochs) => {
    mlp.train(inputs, targets, epochs, 0.2);
    setOutput(mlp.feedforward(inputs[0]).toFixed(2))
    setStepsCount(stepsCount + epochs * inputs.length)
    index.current = 0;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#888' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
        <div style={{ width: 200, height: 200, border: '1px solid black' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            {
              input.map(t => (
                <div key={t}>{ t }</div>
              ))
            }
          </div>
          <div>
            {
              mlp.hidden.map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                  { t.weights.map((w, i) => (
                    <div key={i}>{ w.toFixed(2) }</div>
                  ))}
                </div>
              ))
            }
            {
              mlp.hidden.map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                  <div>{ t.bias.toFixed(2) }</div>
                  <div>{ t.output.toFixed(2) }</div>
                </div>
              ))
            }
          </div>
          <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                  { mlp.output.weights.map((w, i) => (
                    <div key={i}>{ w.toFixed(2) }</div>
                  ))}
                </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                  <div>{ mlp.output.bias.toFixed(2) }</div>
                  <div>{ mlp.output.output.toFixed(2) }</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
          <div style={{}}>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', fontSize: '2rem' }}>
              <div>{ input[0] }</div>
            </div>
            <NeuralNetworkCanvas network={[input.map(n => ({ bias: n, output: n })), mlp.hidden,[mlp.output]]}/>
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', fontSize: '2rem' }}>
            <div>{ output }</div>
          </div>
          <div>
            <div>
              <button onClick={step}>
                Step
              </button>
              <button onClick={isPlaying ? stop : play}>
                { isPlaying ? 'Stop' : 'Play' }
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
