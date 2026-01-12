import React, { useState, useEffect } from "react";
import Select from "react-select";
import SweetAlert from "react-bootstrap-sweetalert";
import { collegeService } from "../../../Academics/Services/college.service";
import { MissionService } from "../../Settings/Services/mission.service";
import { PEOService } from "../../Settings/Services/peo.service"; 
import { MappingService } from "../../Services/mapping.service";

const mappingLevels = [
  { value: "3", label: "3" },
  { value: "2", label: "2" },
  { value: "1", label: "1" },
  { value: "-", label: "-" },
];

export default function ADD_Peo_Mission() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [missions, setMissions] = useState([]);  
  const [peos, setPeos] = useState([]);       
  const [peoMapping, setPeoMapping] = useState({}); 
  const [alert, setAlert] = useState(null);

  useEffect(() => {
  const storedProgram = localStorage.getItem("selectedOBEprogram");

  if (storedProgram && programs.length > 0) {
    const foundProgram = programs.find(
      (p) => Number(p.value) === Number(storedProgram)
    );

    if (foundProgram) {
      setSelectedProgram(foundProgram);
    }
  }
}, [programs]);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const res = await collegeService.getAllprogram();
        const formatted = res.map((p) => ({
          label: p.program_name,
          value: p.program_id,
        }));
        setPrograms(formatted);
      } catch (err) {
        console.error("Failed to load programs:", err);
      }
    };
    loadPrograms();
  }, []);


  useEffect(() => {
    if (!selectedProgram) return;

    const loadData = async () => {
      try {
        const peoRes = await PEOService.getPEOByProgramId(selectedProgram.value);
        const missionRes = await MissionService.getMissionByProgramId(selectedProgram.value);

        setPeos(peoRes || []);
        setMissions(missionRes || []);
 
        const initial = {};
        (peoRes || []).forEach((peo) => {
          initial[peo.nba_peo_id] = {};
          (missionRes || []).forEach((m) => {
            initial[peo.nba_peo_id][m.mission_id] = "-";
          });
        });

        setPeoMapping(initial);
      } catch (err) {
        console.error("Failed to load PEO or Mission:", err);
      }
    };

    loadData();
  }, [selectedProgram]);

  // ---------------- Handle Mapping Change --------------------
  const handleMappingChange = (peoId, missionId, value) => {
    setPeoMapping((prev) => ({
      ...prev,
      [peoId]: { ...prev[peoId], [missionId]: value },
    }));
  };

  // ----------------  Save Payload --------------------
  const handleSave = async () => {
  const mappings = [];

  Object.entries(peoMapping).forEach(([peoId, missionMap]) => {
    Object.entries(missionMap).forEach(([missionId, value]) => {
      if (value !== "-") {
        const peoObj = peos.find((p) => p.nba_peo_id === Number(peoId));

        mappings.push({
          peo_id: Number(peoId),
          peo_statement: peoObj?.peo_statement || "",
          mission_id: Number(missionId),
          correlation_level: value,
        });
      }
    });
  });

  const finalPayload = {
    program_id: selectedProgram.value,
    mappings: mappings,
  };

  console.log("FINAL PAYLOAD:", finalPayload);

  try {
   // 🔹 Step 1: Check if mapping already exists
    const existing = await MappingService.getPEOMissionMapping(
      selectedProgram.value
    );

    if (existing && existing.length > 0) {
      setAlert(
            <SweetAlert
              error
              title="Error!"
              confirmBtnCssClass="btn-confirm"
              onConfirm={() => setAlert(null)}
            >
              Peo-Mission Mapping already exists.
            </SweetAlert>);
      return; 
    }

    // 🔹 Step 2: If not exists → save new mapping
    await MappingService.savePEOMissionMapping(finalPayload);
    
    setAlert(
    <SweetAlert
            success
            title="Saved!"
            confirmBtnCssClass="btn-confirm"
            onConfirm={() => {
              setAlert(null);
              window.location.href = "/obe/Mapping/PEO-MISSION"; // redirect after OK
            }}
          >
            Mission has been saved successfully.
          </SweetAlert>
        );
  } catch (err) {
    console.error(err);
    setAlert(
          <SweetAlert
            error
            title="Error!"
            confirmBtnCssClass="btn-confirm"
            onConfirm={() => setAlert(null)}
          >
            Something went wrong. Please try again.
          </SweetAlert>
        );
  }
};


  return (
    <div className="p-6">

      <h4 className="pageheading text-xl font-semibold mb-6">
        PEO – Mission Mapping
      </h4>

      {/* Program Dropdown */}
      <div className="mb-6">
        <label className="font-semibold mb-2 block">Program</label>
        <Select
          options={programs}
          value={selectedProgram}
          onChange={setSelectedProgram}
          placeholder="Select Program"
        />
      </div>

      {/* Mapping Table */}
      {selectedProgram && (
        <div className="mb-2">

          {peos.length === 0 || missions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No PEO or Mission records found for this program.
            </p>
          ) : (
            <table className="min-w-full border text-center">
              <thead className="bg-primary-600 text-white">
                <tr>
                  <th className="border px-3 py-2">PEO Code</th>
                  <th className="border px-3 py-2">PEO Statement</th>
                  {missions.map((mission) => (
                    <th key={mission.mission_id} className="border px-3 py-2">
                      {mission.mission_code}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {peos.map((peo) => (
                  <tr key={peo.nba_peo_id}>
                    <td className="border px-3 py-2">{peo.peo_code}</td>
                    <td className="border px-3 py-2">{peo.peo_statement}</td>

                    {missions.map((m) => (
                      <td key={m.mission_id} className="border px-2 py-1">
                        <select
                          className="border rounded px-2 py-1 w-full"
                          value={peoMapping[peo.nba_peo_id]?.[m.mission_id] || "-"}
                          onChange={(e) =>
                            handleMappingChange(
                              peo.nba_peo_id,
                              m.mission_id,
                              e.target.value
                            )
                          }
                        >
                          {mappingLevels.map((lvl) => (
                            <option key={lvl.value} value={lvl.value}>
                              {lvl.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Buttons */}
          <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700"
            >
              Save Mapping
            </button>

            <button
              onClick={() => setSelectedProgram(null)}
              className="bg-gray-400 text-white px-5 py-2 rounded shadow hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {alert}
    </div>
  );
}
