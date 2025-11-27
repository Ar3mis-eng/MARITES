import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Activity,
  Shield,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import './Analysis.css';

function Analysis() {
  const [selectedNode, setSelectedNode] = useState(1);
  const [sensorData, setSensorData] = useState({});
  const [nodeStatus, setNodeStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRisk, setExpandedRisk] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [previousReadings, setPreviousReadings] = useState({});

  // --- Simulation Scale Constants ---
  // The simulation is a 4x8x4 ft box with 1.5 cubic meters of sand (~2400 kg)
  const BOX_LENGTH_FT = 8;
  const BOX_WIDTH_FT = 4;
  const BOX_HEIGHT_FT = 4;
  const SAND_VOLUME_M3 = 1.5;
  const SAND_DENSITY = 1600; // kg/m³ (average dry sand)
  const TOTAL_MASS_KG = SAND_VOLUME_M3 * SAND_DENSITY; // ~2400 kg

  // Sensitivity multiplier for small-scale model
  const SCALE_SENSITIVITY = 1.75;

  // Fetch sensor data for selected node
  const fetchSensorData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/sensorData/node${selectedNode}`);
      const data = await response.json();

      // Compute pitch/roll diffs between latest and previous readings
      const newReadings = {};
      Object.keys(data || {}).forEach(sensorId => {
        const readings = data[sensorId];
        if (readings && readings.length >= 2) {
          const latest = readings[readings.length - 1];
          const prev = readings[readings.length - 2];
          const pitchDiff = Math.abs(latest.pitch - prev.pitch);
          const rollDiff = Math.abs(latest.roll - prev.roll);
          newReadings[sensorId] = { pitchDiff, rollDiff };
        }
      });

      setPreviousReadings(newReadings);
      setSensorData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedNode]);

  // Fetch node status
  const fetchNodeStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/nodestatus');
      const data = await response.json();
      setNodeStatus(data);
    } catch (error) {
      console.error('Error fetching node status:', error);
    }
  }, []);

  useEffect(() => {
    fetchSensorData();
    fetchNodeStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSensorData();
      fetchNodeStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchSensorData, fetchNodeStatus]);

  // Calculate risk metrics (miniature-scale calibrated)
  const calculateRiskMetrics = () => {
    const sensors = Object.keys(sensorData);
    if (sensors.length === 0) {
      return {
        overallRisk: 0,
        riskLevel: 'low',
        avgMagnitude: '0.00',
        avgPitch: '0.00',
        avgRoll: '0.00',
        avgPitchJump: '0.00',
        avgRollJump: '0.00',
        maxMagnitude: '0.00'
      };
    }

    let totalMagnitude = 0;
    let totalPitch = 0;
    let totalRoll = 0;
    let maxMagnitude = 0;
    let dataPoints = 0;

    sensors.forEach(sensorId => {
      const readings = sensorData[sensorId];
      if (readings && readings.length > 0) {
        const latestReading = readings[readings.length - 1];
        totalMagnitude += latestReading.magnitude ?? 0;
        totalPitch += Math.abs(latestReading.pitch ?? 0);
        totalRoll += Math.abs(latestReading.roll ?? 0);
        maxMagnitude = Math.max(maxMagnitude, latestReading.magnitude ?? 0);
        dataPoints++;
      }
    });

    const avgMagnitude = dataPoints > 0 ? totalMagnitude / dataPoints : 0;
    const avgPitch = dataPoints > 0 ? totalPitch / dataPoints : 0;
    const avgRoll = dataPoints > 0 ? totalRoll / dataPoints : 0;

    // Base risk score (0-100) using prior logic as starting point
    let riskScore = 0;
    riskScore += Math.min((avgMagnitude / 5) * 40, 40); // magnitude part
    riskScore += Math.min((avgPitch / 30) * 30, 30);    // pitch part
    riskScore += Math.min((avgRoll / 30) * 30, 30);     // roll part

    // Compute pitch/roll jumps across sensors
    let totalPitchJump = 0;
    let totalRollJump = 0;
    let jumpCount = 0;
    Object.values(previousReadings).forEach(({ pitchDiff = 0, rollDiff = 0 }) => {
      totalPitchJump += pitchDiff;
      totalRollJump += rollDiff;
      jumpCount++;
    });

    const avgPitchJump = jumpCount > 0 ? totalPitchJump / jumpCount : 0;
    const avgRollJump = jumpCount > 0 ? totalRollJump / jumpCount : 0;

    // Scale the jumps for miniature model (higher sensitivity)
    const scaledPitchJump = avgPitchJump * SCALE_SENSITIVITY;
    const scaledRollJump = avgRollJump * SCALE_SENSITIVITY;

    // Jump thresholds tuned for the scaled model
    // scaledJump > 15 => high, >7 => medium, >3 => low
    let jumpRisk = 0;
    if (scaledPitchJump > 15 || scaledRollJump > 15) jumpRisk = 20;
    else if (scaledPitchJump > 7 || scaledRollJump > 7) jumpRisk = 10;
    else if (scaledPitchJump > 3 || scaledRollJump > 3) jumpRisk = 5;

    riskScore += jumpRisk;

    // Slightly adjust risk based on total mass (heavier mass = slightly more risk)
    const massFactor = Math.min(TOTAL_MASS_KG / 2500, 1.2); // ~1.0–1.2
    riskScore *= massFactor;

    // Clip and classify
    const overallRisk = Math.min(Math.round(riskScore), 100);
    let riskLevel = 'low';
    if (overallRisk > 67) riskLevel = 'high';
    else if (overallRisk > 33) riskLevel = 'medium';

    return {
      overallRisk,
      riskLevel,
      avgMagnitude: avgMagnitude.toFixed(2),
      avgPitch: avgPitch.toFixed(2),
      avgRoll: avgRoll.toFixed(2),
      avgPitchJump: scaledPitchJump.toFixed(2),
      avgRollJump: scaledRollJump.toFixed(2),
      maxMagnitude: maxMagnitude.toFixed(2)
    };
  };

  const metrics = calculateRiskMetrics();

  // Risk factor cards (use metrics)
  const riskFactors = [
    {
      id: 'magnitude',
      name: 'Ground Acceleration',
      value: metrics.avgMagnitude,
      unit: 'g',
      threshold: 0.5, // scaled threshold hint
      severity: parseFloat(metrics.avgMagnitude) > 1 ? 'high' : parseFloat(metrics.avgMagnitude) > 0.5 ? 'medium' : 'low',
      trend: 'monitoring',
      description: 'Average acceleration magnitude detected across all sensors in the node.',
      recommendation:
        parseFloat(metrics.avgMagnitude) > 1
          ? 'Critical acceleration detected. Immediate inspection required.'
          : parseFloat(metrics.avgMagnitude) > 0.5
          ? 'Elevated acceleration. Continue enhanced monitoring.'
          : 'Acceleration within normal parameters.'
    },
    {
      id: 'pitch',
      name: 'Pitch Angle',
      value: metrics.avgPitch,
      unit: '°',
      threshold: 7, // scaled safe threshold
      severity: parseFloat(metrics.avgPitch) > 12 ? 'high' : parseFloat(metrics.avgPitch) > 7 ? 'medium' : 'low',
      trend: 'monitoring',
      description: 'Average pitch deviation indicating forward/backward slope movement.',
      recommendation:
        parseFloat(metrics.avgPitch) > 12
          ? 'Significant pitch detected. Deploy field inspection team.'
          : parseFloat(metrics.avgPitch) > 7
          ? 'Moderate pitch changes observed.'
          : 'Pitch angles stable.'
    },
    {
      id: 'roll',
      name: 'Roll Angle',
      value: metrics.avgRoll,
      unit: '°',
      threshold: 7,
      severity: parseFloat(metrics.avgRoll) > 12 ? 'high' : parseFloat(metrics.avgRoll) > 7 ? 'medium' : 'low',
      trend: 'monitoring',
      description: 'Average roll deviation indicating lateral slope movement.',
      recommendation:
        parseFloat(metrics.avgRoll) > 12
          ? 'Critical roll detected. Assess structural stability.'
          : parseFloat(metrics.avgRoll) > 7
          ? 'Moderate roll detected.'
          : 'Roll angles within safe range.'
    },
    {
      id: 'jump',
      name: 'Pitch/Roll Jumps (Scaled)',
      value: `${metrics.avgPitchJump}° / ${metrics.avgRollJump}°`,
      unit: '',
      threshold: 7,
      severity:
        parseFloat(metrics.avgPitchJump) > 15 || parseFloat(metrics.avgRollJump) > 15
          ? 'high'
          : parseFloat(metrics.avgPitchJump) > 7 || parseFloat(metrics.avgRollJump) > 7
          ? 'medium'
          : parseFloat(metrics.avgPitchJump) > 3 || parseFloat(metrics.avgRollJump) > 3
          ? 'low'
          : 'low',
      trend: 'sudden change',
      description: 'Average pitch/roll variation adjusted for simulation scale.',
      recommendation:
        parseFloat(metrics.avgPitchJump) > 15 || parseFloat(metrics.avgRollJump) > 15
          ? 'Abrupt slope shift detected in scaled model — likely slide initiation.'
          : parseFloat(metrics.avgPitchJump) > 7 || parseFloat(metrics.avgRollJump) > 7
          ? 'Moderate displacement observed — maintain frequent monitoring.'
          : 'Minor angular change within stable range.'
    },
    {
      id: 'maxMagnitude',
      name: 'Peak Acceleration',
      value: metrics.maxMagnitude,
      unit: 'g',
      threshold: 1.0,
      severity: parseFloat(metrics.maxMagnitude) > 1.0 ? 'high' : parseFloat(metrics.maxMagnitude) > 0.5 ? 'medium' : 'low',
      trend: 'monitoring',
      description: 'Maximum acceleration recorded by any sensor in the node.',
      recommendation:
        parseFloat(metrics.maxMagnitude) > 1.0
          ? 'Extreme peak detected. Initiate emergency protocol.'
          : parseFloat(metrics.maxMagnitude) > 0.5
          ? 'Elevated peaks observed.'
          : 'Peak values normal.'
    }
  ];

  // helpers for CSS classes (used in JSX)
  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return 'riskHigh';
      case 'medium':
        return 'riskMedium';
      case 'low':
        return 'riskLow';
      default:
        return 'riskNormal';
    }
  };

  const getRiskBadgeColor = (level) => {
    switch (level) {
      case 'high':
        return 'badgeHigh';
      case 'medium':
        return 'badgeMedium';
      case 'low':
        return 'badgeLow';
      default:
        return 'badgeNormal';
    }
  };

  const currentNodeStatus = nodeStatus.find((n) => n.nodeId === `Node ${selectedNode}`);

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleString();
  };

  return (
    <div className="analysisContainer">
      {/* Header */}
      <div className="analysisHeader">
        <div className="headerContent">
          <Shield className="headerIcon" />
          <div>
            <h2>Risk Analysis Dashboard</h2>
            <p>Miniature-Scale Landslide Simulation (4×8×4 ft, 1.5 m³ sand)</p>
          </div>
        </div>
        <button
          onClick={() => {
            fetchSensorData();
            fetchNodeStatus();
          }}
          className="refreshButton"
        >
          <RefreshCw className="refreshIcon" />
          Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="controlsPanel">
        <div className="controlGroup">
          <label>Monitoring Node</label>
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(Number(e.target.value))}
            className="nodeSelect"
          >
            <option value={1}>Node 1 (Sensors 1-4)</option>
            <option value={2}>Node 2 (Sensors 5-8)</option>
            <option value={3}>Node 3 (Sensors 9-12)</option>
          </select>
        </div>
        {currentNodeStatus && (
          <div className="statusInfo">
            <span className="statusLabel">Status:</span>
            <span className={currentNodeStatus.status.includes('Missing') ? 'statusWarning' : 'statusNormal'}>
              {currentNodeStatus.status}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loadingState">
          <div className="spinner"></div>
          <p>Loading sensor data...</p>
        </div>
      ) : (
        <>
          {/* Overall Risk Score */}
          <div className="overallRiskCard">
            <div className="riskCardContent">
              <div className="riskMainInfo">
                <div className="riskHeader">
                  <AlertTriangle className="riskIcon" />
                  <h3>Overall Risk Assessment</h3>
                </div>
                <p className="nodeInfo">Node {selectedNode} • {Object.keys(sensorData).length} Active Sensors</p>

                <div className="riskScoreDisplay">
                  <div className="riskScoreNumber">{metrics.overallRisk}</div>
                  <div>
                    <div className={`riskBadge ${getRiskBadgeColor(metrics.riskLevel)}`}>
                      {metrics.riskLevel.toUpperCase()} RISK
                    </div>
                    <p className="updateTime">Updated {formatTimestamp(lastUpdate)}</p>
                  </div>
                </div>

                {/* Risk Score Bar */}
                <div className="riskBar">
                  <div
                    className={`riskBarFill ${getRiskBadgeColor(metrics.riskLevel)}`}
                    style={{ width: `${metrics.overallRisk}%` }}
                  ></div>
                </div>
                <div className="riskBarLabels">
                  <span>Low (0-33)</span>
                  <span>Medium (34-66)</span>
                  <span>High (67-100)</span>
                </div>
              </div>

              <div className="monitoringIcon">
                <Eye className="eyeIcon" />
                <p>Active Monitoring</p>
              </div>
            </div>
          </div>

          {/* Risk Factors Grid */}
          <div className="riskFactorsGrid">
            {riskFactors.map((factor) => (
              <div
                key={factor.id}
                className={`riskFactorCard ${getRiskColor(factor.severity)}`}
                onClick={() => setExpandedRisk(expandedRisk === factor.id ? null : factor.id)}
              >
                <div className="factorHeader">
                  <div className="factorInfo">
                    <h4>{factor.name}</h4>
                    <div className="factorValue">
                      <span className="valueNumber">{factor.value}</span>
                      <span className="valueUnit">{factor.unit}</span>
                    </div>
                  </div>
                  <div className="factorBadges">
                    <span className={`severityBadge ${getRiskBadgeColor(factor.severity)}`}>
                      {factor.severity.toUpperCase()}
                    </span>
                    {expandedRisk === factor.id ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>

                <div className="factorMetadata">
                  <Activity className="metaIcon" />
                  <span>Trend: {factor.trend}</span>
                  <span className="metaDivider">•</span>
                  <span>Threshold: {factor.threshold} {factor.unit}</span>
                </div>

                {expandedRisk === factor.id && (
                  <div className="factorDetails">
                    <p className="detailDescription">{factor.description}</p>
                    <div className="recommendationBox">
                      <p className="recommendationTitle">Analysis:</p>
                      <p>{factor.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Risk Matrix */}
          <div className="riskMatrixCard">
            <div className="matrixHeader">
              <TrendingUp className="matrixIcon" />
              <h3>Risk Matrix</h3>
            </div>

            <div className="tableWrapper">
              <table className="riskTable">
                <thead>
                  <tr>
                    <th>Risk Category</th>
                    <th>Status</th>
                    <th>Probability</th>
                    <th>Impact</th>
                    <th>Mitigation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="categoryCell">Rapid Ground Movement</td>
                    <td>
                      <span className={`statusBadge ${parseFloat(metrics.avgMagnitude) > 1 ? 'badgeHigh' : parseFloat(metrics.avgMagnitude) > 0.5 ? 'badgeMedium' : 'badgeLow'}`}>
                        {parseFloat(metrics.avgMagnitude) > 1 ? 'CRITICAL' : parseFloat(metrics.avgMagnitude) > 0.5 ? 'WARNING' : 'NORMAL'}
                      </span>
                    </td>
                    <td>{parseFloat(metrics.avgMagnitude) > 1 ? 'High (75%)' : parseFloat(metrics.avgMagnitude) > 0.5 ? 'Medium (45%)' : 'Low (15%)'}</td>
                    <td>Severe</td>
                    <td className="mitigationCell">Deploy field team, increase monitoring frequency</td>
                  </tr>
                  <tr>
                    <td className="categoryCell">Slope Instability</td>
                    <td>
                      <span className={`statusBadge ${(parseFloat(metrics.avgPitch) > 12 || parseFloat(metrics.avgRoll) > 12) ? 'badgeHigh' : (parseFloat(metrics.avgPitch) > 7 || parseFloat(metrics.avgRoll) > 7) ? 'badgeMedium' : 'badgeLow'}`}>
                        {(parseFloat(metrics.avgPitch) > 12 || parseFloat(metrics.avgRoll) > 12) ? 'CRITICAL' : (parseFloat(metrics.avgPitch) > 7 || parseFloat(metrics.avgRoll) > 7) ? 'WARNING' : 'NORMAL'}
                      </span>
                    </td>
                    <td>{(parseFloat(metrics.avgPitch) > 12 || parseFloat(metrics.avgRoll) > 12) ? 'High (70%)' : (parseFloat(metrics.avgPitch) > 7 || parseFloat(metrics.avgRoll) > 7) ? 'Medium (40%)' : 'Low (10%)'}</td>
                    <td>High</td>
                    <td className="mitigationCell">Structural assessment, evacuation planning</td>
                  </tr>
                  <tr>
                    <td className="categoryCell">Sensor Anomaly</td>
                    <td>
                      <span className={`statusBadge ${currentNodeStatus?.status.includes('Missing') ? 'badgeMedium' : 'badgeLow'}`}>
                        {currentNodeStatus?.status.includes('Missing') ? 'WARNING' : 'NORMAL'}
                      </span>
                    </td>
                    <td>{currentNodeStatus?.status.includes('Missing') ? 'Medium (35%)' : 'Low (5%)'}</td>
                    <td>Moderate</td>
                    <td className="mitigationCell">Verify sensor connectivity, maintenance check</td>
                  </tr>
                  <tr>
                    <td className="categoryCell">Peak Acceleration Event</td>
                    <td>
                      <span className={`statusBadge ${parseFloat(metrics.maxMagnitude) > 1.0 ? 'badgeHigh' : parseFloat(metrics.maxMagnitude) > 0.5 ? 'badgeMedium' : 'badgeLow'}`}>
                        {parseFloat(metrics.maxMagnitude) > 1.0 ? 'CRITICAL' : parseFloat(metrics.maxMagnitude) > 0.5 ? 'WARNING' : 'NORMAL'}
                      </span>
                    </td>
                    <td>{parseFloat(metrics.maxMagnitude) > 1.0 ? 'High (65%)' : parseFloat(metrics.maxMagnitude) > 0.5 ? 'Medium (30%)' : 'Low (12%)'}</td>
                    <td>Variable</td>
                    <td className="mitigationCell">Review historical data, investigate trigger</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Items */}
          <div className="actionItemsCard">
            <h3>Recommended Actions</h3>
            <ul className="actionList">
              {metrics.overallRisk > 67 && (
                <>
                  <li>Issue evacuation advisory for high-risk areas near Node {selectedNode}</li>
                  <li>Deploy emergency response team for immediate site inspection</li>
                </>
              )}
              {parseFloat(metrics.avgMagnitude) > 0.5 && (
                <li>Increase sensor polling frequency to 5-minute intervals</li>
              )}
              {currentNodeStatus?.status.includes('Missing') && (
                <li>Investigate and repair missing sensors: {currentNodeStatus.status}</li>
              )}
              {metrics.overallRisk <= 33 && (
                <li>Continue routine monitoring at standard intervals</li>
              )}
              <li>Coordinate with local disaster management office</li>
              <li>Update community alert system with current risk level</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default Analysis;
