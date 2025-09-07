import React from 'react'
import Form from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'
import schema from './schema.json'
import axios from 'axios'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

// --- Client-side rules ---
function clientSideCheck(formData) {
  const violations = []
  if (formData.model === 'C' && formData.color === 'red') {
    violations.push({ field: 'color', message: 'Red is not allowed for model C (client check)' })
  }
  if ((formData.model === 'A' || formData.model === 'B') && !formData.size) {
    violations.push({ field: 'size', message: 'Size is required for models A and B (client check)' })
  }
  return violations
}

// --- Custom Submit Button ---
function CustomSubmitButton() {
  return (
    <button
      type="submit"
      className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-300 focus:outline-none"
    >
      Apply Configuration
    </button>
  )
}

// --- Model Viewer ---
function ModelViewer({ model, color }) {
  if (!model) return null

  let geometry
  switch (model) {
    case 'A':
      geometry = <boxGeometry args={[1, 1, 1]} />
      break
    case 'B':
      geometry = <sphereGeometry args={[0.8, 32, 32]} />
      break
    case 'C':
      geometry = <cylinderGeometry args={[0.6, 0.6, 1, 32]} />
      break
    default:
      geometry = <boxGeometry args={[1, 1, 1]} />
  }

  return (
    <div className="w-full h-80 rounded-2xl shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 overflow-hidden">
      <Canvas 
        style={{ width: '100%', height: '100%' }}
        camera={{ 
          position: [3, 3, 3], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: true
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <mesh position={[0, 0, 0]} scale={[1, 1, 1]}>
          {geometry}
          <meshStandardMaterial color={color || 'gray'} />
        </mesh>
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={6}
          zoomSpeed={0.5}
          rotateSpeed={0.5}
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>
    </div>
  )
}

export default function App() {
  const [serverViolations, setServerViolations] = React.useState([])
  const [status, setStatus] = React.useState('')
  const [formData, setFormData] = React.useState({})

  const onSubmit = async ({ formData }) => {
    const clientViolations = clientSideCheck(formData)
    if (clientViolations.length) {
      setServerViolations(clientViolations)
      setStatus('client-error')
      return
    }

    setStatus('validating')
    try {
      const resp = await axios.post('http://localhost:4000/api/validate', formData)
      if (resp.data.valid) {
        setServerViolations([])
        setStatus('valid')
        alert('Configuration valid!')
      } else {
        setServerViolations(resp.data.violations)
        setStatus('server-error')
      }
    } catch (err) {
      console.error(err)
      setStatus('server-failed')
    }
  }

  // uiSchema
  const uiSchema = {
    model: { 
      'ui:widget': 'select', 
      'ui:placeholder': 'Select Model',
      'ui:options': { 
        classNames: 'w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700 font-medium shadow-sm hover:border-slate-300',
        placeholder: 'Select Model'
      } 
    },
    color: { 
      'ui:widget': 'select', 
      'ui:placeholder': 'Select Color',
      'ui:options': { 
        classNames: 'w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700 font-medium shadow-sm hover:border-slate-300',
        placeholder: 'Select Color'
      } 
    },
    size: { 
      'ui:widget': 'select', 
      'ui:placeholder': 'Select Size',
      'ui:options': { 
        classNames: 'w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-slate-700 font-medium shadow-sm hover:border-slate-300',
        placeholder: 'Select Size'
      } 
    },
  }

  const getStatusDisplay = () => {
    const statusConfig = {
      'validating': { 
        text: 'Validating...', 
        classes: 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-800 border-yellow-200' 
      },
      'valid': { 
        text: 'Configuration Valid!', 
        classes: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200' 
      },
      'client-error': { 
        text: 'Client Validation Failed', 
        classes: 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200' 
      },
      'server-error': { 
        text: 'Server Validation Failed', 
        classes: 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200' 
      },
      'server-failed': { 
        text: 'Connection Failed', 
        classes: 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border-gray-200' 
      }
    }
    return statusConfig[status] || null
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight pb-2">
            BOM Configurator
          </h1>
          <p className="text-xl text-slate-600 font-medium">
            Configure your BOM in real-time
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold text-slate-800">Configuration Panel</h2>
            </div>
            
            <Form
              schema={schema}
              validator={validator}
              formData={formData}
              onChange={e => setFormData(e.formData)}
              onSubmit={onSubmit}
              uiSchema={uiSchema}
              templates={{
                ButtonTemplates: { SubmitButton: CustomSubmitButton },
              }}
            />
          </div>
          
          {/* Preview Section */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold text-slate-800">Live Preview</h2>
            </div>
            <ModelViewer model={formData.model} color={formData.color} />
            
            {!formData.model && (
              <div className="flex items-center justify-center h-80 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300 mt-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-slate-500 font-medium">Select a model to preview</p>
                </div>
              </div>
            )}
          </div>

          
        </div>

        {/* Status and Violations */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* Status */}
          {statusDisplay && (
            <div className={`p-6 rounded-2xl border-2 font-bold text-lg shadow-lg ${statusDisplay.classes}`}>
              <div className="flex items-center">
                Status: {statusDisplay.text}
              </div>
            </div>
          )}

          {/* Violations */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Validation Results</h3>
            </div>
            
            {serverViolations.length === 0 ? (
              <div className="flex items-center text-emerald-600 font-semibold">
                All validations passed!
              </div>
            ) : (
              <div className="space-y-3">
                {serverViolations.map(v => (
                  <div key={v.id || v.message} className="flex items-start p-4 bg-red-50 border border-red-200 rounded-xl">
                    <span className="text-red-500 text-xl mr-3 mt-0.5">⚠️</span>
                    <div>
                      <div className="font-bold text-red-800 capitalize">{v.field}</div>
                      <div className="text-red-600">{v.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}