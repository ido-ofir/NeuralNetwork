import React, { useRef, useState } from 'react';
import { NeuralNetworkCanvas } from './NeuralNetworkCanvas';


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
    let numInputs = layers.shift()
    this.layers = layers.map(l => {
      const layer = Array.from({ length: l }, () => new Neuron(numInputs))
      numInputs = l
      return layer
    });
  }

  feedforward(inputs) {
    let outputs = inputs
    this.layers.map(layer => {
      outputs = layer.map(n => n.feedforward(outputs))
    })
    return outputs;
  }

  getOutputs(inputs) {
    const outputs = []
    this.layers.map(layer => {
      outputs.push(layer.map(n => n.feedforward(outputs[outputs.length - 1] || inputs)))
    })
    return outputs;
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
        let allOutputs = this.getOutputs(inputs[i]);
        let errors = allOutputs[allOutputs.length - 1].map((t, k) => targets[i][k] - t);

        for (let l = this.layers.length - 1; l >= 0; l--) {
          const layer = this.layers[l];
          const outputs = allOutputs[l];
          const currentInputs = allOutputs[l - 1] || inputs
          const outputDirevatives = outputs.map(sigmoidDerivative);
          for (let g = 0; g < layer.length; g++) {
            const neuron = layer[g];
            neuron.weights = neuron.weights.map((w, wi) => {
              const value = w + lr * errors[g] * outputDirevatives[g] * currentInputs[wi];
              return value
            });
            neuron.bias = neuron.bias + lr * errors[g] * outputDirevatives[g];
          }
          errors = errors.map(e => e * (1 - lr));
        }
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
let targets = [[1], [0]]; // targets for XOR gate

let mlp = new MLP([
  1,
  1,
  1,
]);

let outputValue = mlp.feedforward(inputs[0])[0].toFixed(2)

console.log(outputValue)

const App = () => {
  const index = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [output, setOutput] = useState(outputValue)
  const [stepsCount, setStepsCount] = useState(0)
  const interval = useRef(null)
  const input = inputs[index.current]
  const target = targets[index.current]
  const step = () => {
    let i = index.current + 1
    if (i >= inputs.length) {
      i = 0
    }
    const input = inputs[i]
    const target = targets[i]
    mlp.train([input], [target], 1, 0.2);
    setOutput(mlp.feedforward(inputs[i])[0].toFixed(2))
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
    setOutput(mlp.feedforward(inputs[0])[0].toFixed(2))
    setStepsCount(stepsCount + epochs * inputs.length)
    index.current = 0;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#888' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
        <div style={{ width: 200, border: '1px solid black' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            {
              input.map(t => (
                <div key={t} style={{ marginBottom: 10 }}>
                  <div>Input</div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>{t}</div>
                </div>
              ))
            }
          </div>
          <div>
            {
              mlp.layers.map((layer, i) => (
                <div key={i} style={{}}>
                  {
                    layer.map(t => (
                      <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginBottom: 10 }}>
                        {t.weights.map((w, i) => (
                          <div key={i}>
                            <div>Weight</div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>{w.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    ))
                  }
                  {
                    layer.map(t => (
                      <div key={t} style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-around' }}>
                        <div style={{ marginBottom: 10 }}>
                          <div>Bias</div>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>{t.bias.toFixed(2)}</div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div>Output</div>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>{t.output.toFixed(2)}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ))
            }

          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
          <div style={{}}>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', fontSize: '2rem' }}>
              <div>{input[0]}</div>
            </div>
            <NeuralNetworkCanvas network={[input.map(n => ({ bias: n, output: n })), ...mlp.layers]} />
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', fontSize: '2rem' }}>
            <div>{output}</div>
          </div>
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
