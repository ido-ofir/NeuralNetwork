import React, { useRef, useState } from 'react';
import { Matrix } from "./Matrix.mjs";
import { NeuralNetwork } from './NeuralNetwork.mjs';
import { NeuralNetworkCanvas } from './NeuralNetworkCanvas2';

const neuralNetwork = new NeuralNetwork([
  1,
  1
], 1)

let inputs = [
  [0],
  [1],
];
let targets = [[1], [0]];

const cn = {
  biases: new Matrix(1, 1).map(t => 0),
  outputs: new Matrix(1, 1).map(t => 0),
}

const outputs = inputs.map(i => neuralNetwork.feedforward(i)[0].toFixed(2))

const App = () => {
  const index = useRef(0)
  const [output, setOutput] = useState(outputs[0])
  const input = inputs[index.current]
  const target = targets[index.current]
  const [canvasNetwork, setCanvasNetwork] = useState([{ biases: { data: [0] }, outputs: { data: [0] } }, ...neuralNetwork.layers])
  const [isPlaying, setIsPlaying] = useState(false)
  const [stepsCount, setStepsCount] = useState(0)
  const interval = useRef(null)
  const step = () => {
    let i = index.current + 1
    if (i >= inputs.length) {
      i = 0
    }
    const input = inputs[i]
    const target = targets[i]
    neuralNetwork.train([input], [target], 1, 0.2);
    const outputs = neuralNetwork.feedforward(input);
    setOutput(outputs[0].toFixed(2))
    setCanvasNetwork([{ biases: { data: [0] }, outputs: { data: outputs } }, ...neuralNetwork.layers])
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

  const train = (epochs) => {
    neuralNetwork.train(inputs, targets, epochs, 0.2);
    const outputs = neuralNetwork.feedforward(inputs[0]);
    setOutput(outputs[0].toFixed(2))
    setStepsCount(stepsCount + epochs * inputs.length)
    setCanvasNetwork([{ biases: { data: [0] }, outputs: { data: outputs } }, ...neuralNetwork.layers])
    index.current = 0;
  }


  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#888' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
        <div style={{ width: 200, height: 200, border: '1px solid black' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            {
              input.map(t => (
                <div key={t}>{t}</div>
              ))
            }
          </div>
          <div>
            {
              neuralNetwork.layers.map((layer, i) => (
                <div key={i} style={{}}>
                  {
                    layer.weights.data.map(t => (
                      <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                        {t.map((w, i) => (
                          <div key={i}>{w.toFixed(2)}</div>
                        ))}
                      </div>
                    ))
                  }
                  {
                    layer.outputs.data.map((t, i) => (
                      <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                        <div>{layer.biases.data[i][0].toFixed(2)}</div>
                        <div>{t[0].toFixed(2)}</div>
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
            <NeuralNetworkCanvas network={canvasNetwork} />
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
