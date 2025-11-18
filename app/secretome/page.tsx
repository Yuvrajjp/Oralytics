// app/secretome/page.tsx
import SecretionSystemViewer from '@/components/secretion-system-viewer';

export default function SecretomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Secretome Analysis
        </h1>
        <p className="text-lg text-gray-600">
          Explore secreted proteins and secretion systems in <em>Aggregatibacter actinomycetemcomitans</em>
        </p>
      </div>

      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">
          🔬 Leukotoxin T1SS Test Case
        </h2>
        <p className="text-blue-800 mb-4">
          This view demonstrates the complete Type I Secretion System (T1SS) for the RTX leukotoxin LtxA,
          including the toxin-activating enzyme, the toxin itself, and the secretion machinery components.
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">System Components:</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Toxin-activating lysine-acyltransferase (KO461_06310)</li>
              <li>RTX family leukotoxin LtxA (KO461_06315)</li>
              <li>Type I secretion system permease/ATPase (KO461_06320)</li>
              <li>HlyD family periplasmic adaptor (KO461_06325)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Key Features:</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Genomic organization visualization</li>
              <li>Subcellular localization prediction</li>
              <li>Component type classification</li>
              <li>Protein sequence information</li>
              <li>3D structure visualization with AlphaFold</li>
            </ul>
          </div>
        </div>
      </div>

      <SecretionSystemViewer />

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          📚 References &amp; Data Sources
        </h2>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Genomic Data:</strong> <em>A. actinomycetemcomitans</em> strain CU1000N chromosome (CP076449.1)
          </p>
          <p>
            <strong>Literature:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              Aggregatibacter actinomycetemcomitans Leukotoxin (LtxA): A Powerful Tool with Capacity to Cause Imbalance in the Host Inflammatory Response (PMC3949334)
            </li>
            <li>
              Proteomics of Protein Secretion by Aggregatibacter actinomycetemcomitans (PMC3405016)
            </li>
            <li>
              Type I Secretion Systems in <em>Aggregatibacter actinomycetemcomitans</em>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-yellow-900 mb-3">
          🚀 Next Steps
        </h2>
        <div className="text-sm text-yellow-800 space-y-2">
          <p>This is the initial test case focusing on the leukotoxin T1SS. Future enhancements will include:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Full proteome secretion pathway classification</li>
            <li>Signal peptide and transmembrane prediction</li>
            <li>Outer membrane vesicle (OMV) protein analysis</li>
            <li>Type II and other secretion systems</li>
            <li>ML-based structure prediction integration</li>
            <li>Protein-DNA mapping for secreted proteins</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
