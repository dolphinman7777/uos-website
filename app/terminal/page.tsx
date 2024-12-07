export default function Terminal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-purple-100">
      <div className="w-full max-w-4xl mx-auto p-4">
        <div 
          className="w-full rounded-lg overflow-hidden shadow-2xl"
          style={{
            backgroundColor: '#c0c0c0',
            boxShadow: 'inset 1px 1px #dfdfdf, inset -1px -1px #0a0a0a'
          }}
        >
          {/* Terminal header with dots */}
          <div className="flex gap-2 p-2" style={{ backgroundColor: '#c0c0c0' }}>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          <div 
            className="font-mono p-4 min-h-[600px]" 
            style={{ 
              backgroundColor: '#c0c0c0',
              color: 'black',
              boxShadow: 'inset -1px -1px #dfdfdf, inset 1px 1px #0a0a0a'
            }}
          >
            <div>Enter your command...</div>
            <div className="mt-2">
              <span>{'>'}</span>
              <span className="ml-2">Enter your command...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 