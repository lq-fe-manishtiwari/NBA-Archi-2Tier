// CriterionForm9.jsx

import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import { nbaOptimizedAPIService } from "../../../../Services/NBA-OptimizedAPI.service";
import GenericCriteriaForm from "./GenericCriteriaForm";

const CriterionForm9 = ({
  section,
  nba_accredited_program_id,
  academic_year,
  nba_criteria_sub_level2_id,
  contributor_allocation_id: nba_contributor_allocation_id,
  completed = false,
  isContributorEditable = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const sectionConfig = {
    "9.1": {
      title: "9.1. First Year Student-Faculty Ratio (FYSFR) (05)",
      totalMarks: 5,
      fields: [
        {
          name: "9.1.1",
          label: "Data for first year courses to calculate the FYSFR",
          marks: 5,
          hasTable: true,
          tableConfig: {
            title: "Table No. 9.1.1: FYSFR details",
            columns: [
              { field: "year", header: "Year" },
              { field: "sanctioned_intake", header: "Sanctioned intake of all UG programs (S4)" },
              { field: "required_faculty", header: "No. of required faculty (RF4= S4/20)" },
              { field: "faculty_basic_science", header: "No. of faculty members in Basic Science Courses & Humanities and Social Sciences including Management courses (NS1)" },
              { field: "faculty_engineering", header: "No. of faculty members in Engineering Science Courses (NS2)" },
              { field: "percentage", header: "Percentage= No. of faculty members ((NS1*0.8) +(NS2*0.2))/(No. of required faculty (RF4))" }
            ],
            defaultRows: [
              { year: "CAY", sanctioned_intake: "", required_faculty: "", faculty_basic_science: "", faculty_engineering: "", percentage: "" },
              { year: "CAYm1", sanctioned_intake: "", required_faculty: "", faculty_basic_science: "", faculty_engineering: "", percentage: "" },
              { year: "CAYm2", sanctioned_intake: "", required_faculty: "", faculty_basic_science: "", faculty_engineering: "", percentage: "" }
            ]
          }
        }
      ]
    },

    "9.2": {
      title: "9.2. Mentoring System (05)",
      totalMarks: 5,
      fields: [
        { name: "9.2.1", label: "Type of mentoring: Professional guidance/career advancement/course work specific/laboratory specific/all-round development. Number of faculty mentors: Number of students per mentor: Frequency of meeting", marks: 5 }
      ]
    },

    "9.3": {
      title: "9.3. Feedback Analysis (20)",
      totalMarks: 20,
      fields: [
        { name: "9.3.1", label: "9.3.1. Feedback on Teaching and Learning Process and Corrective Measures Taken, if any (10)", marks: 10 },
        { name: "9.3.2", label: "9.3.2. Feedback on Academic Facilities (10)", marks: 10 }
      ]
    },

    "9.4": {
      title: "9.4. Training and Placement Support (10)",
      totalMarks: 10,
      fields: [
        { name: "9.4.1", label: "Provide details of the training and placement supports, calendar of scheduled activities for guidance and effectiveness of career guidance, industry interaction exclusively for pre-placement/ internship/placement/counseling and support for higher study etc.", marks: 10 }
      ]
    },

    "9.5": {
      title: "9.5. Start-up and Entrepreneurship Activities (05)",
      totalMarks: 5,
      fields: [
        { name: "9.5.1", label: "Describe the initiatives, facilities creation and their effectiveness in encouraging students for innovation, entrepreneurship, incubation and start-up. Also provide the list of beneficiaries.", marks: 5 }
      ]
    },

    "9.6": {
      title: "9.6. Governance and Transparency (15)",
      totalMarks: 15,
      fields: [
        { name: "9.6.1", label: "9.6.1. Governing Body, Administrative Setup, Functions of Various Bodies, Service Rules, Recruitment procedures and Promotion Policies (10)", marks: 10 },
        { name: "9.6.2", label: "9.6.2. Transparency (05)", marks: 5 }
      ]
    },

    "9.7": {
      title: "9.7. Budget Allocation, Utilization, and Public Accounting at Institute Level (12)",
      totalMarks: 12,
      fields: [
        {
          name: "9.7.1",
          label: "Provide a summary of the financial year's budget and actual expenditure incurred exclusively for the institution in the three financial years: CFYm1, CFYm2, and CFYm3",
          marks: 6,
          hasTable: true,
          tableConfig: {
            title: "Table No. 9.7.1: Summary of budget and actual expenditure incurred at Institute level for CFY m1",
            columns: [
              { field: "source", header: "Total Income in the CFYm1" },
              { field: "actual_expenditure", header: "Actual expenditure in the CFYm1" },
              { field: "total_students", header: "Total Students in the institute" },
              { field: "expenditure_per_student", header: "Expenditure per student in CFYm1" }
            ],
            defaultRows: [
              { source: "Fee", actual_expenditure: "", total_students: "", expenditure_per_student: "" },
              { source: "Govt.", actual_expenditure: "", total_students: "", expenditure_per_student: "" },
              { source: "Grant(s)", actual_expenditure: "", total_students: "", expenditure_per_student: "" },
              { source: "Other Sources (specify)", actual_expenditure: "", total_students: "", expenditure_per_student: "" }
            ]
          }
        },
        {
          name: "9.7.2",
          label: "Budget and actual expenditure incurred at Institute level",
          marks: 6,
          hasTable: true,
          tableConfig: {
            title: "Table No. 9.7.2: Budget and actual expenditure incurred at Institute level",
            columns: [
              { field: "items", header: "Items" },
              { field: "budget_cfy", header: "Budget ed in CFY" },
              { field: "actual_expenses_cfy", header: "Actual expenses in CFY (till ...)" },
              { field: "budget_cfym1", header: "Budget ed in CFYm1" },
              { field: "actual_expenses_cfym1", header: "Actual Expenses in CFYm1" },
              { field: "budget_cfym2", header: "Budget ed in CFYm2" },
              { field: "actual_expenses_cfym2", header: "Actual Expenses in CFYm2" },
              { field: "budget_cfym3", header: "Budget ed in CFYm3" },
              { field: "actual_expenses_cfym3", header: "Actual Expenses in CFYm3" }
            ],
            defaultRows: [
              { items: "Infrastructure Built-Up", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
              { items: "Library", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
              { items: "Laboratory equipment", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
              { items: "Teaching and non-teaching staff salary", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
              { items: "Outreach Programs", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
              { items: "R&D", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
              { items: "Training, Placement and Industry linkage", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
              { items: "SDGs", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
              { items: "Entrepreneurship", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
              { items: "Others*, pl. specify", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" }
            ]
          }
        }
      ]
    },

    "9.8": {
      title: "9.8. Program Specific Budget Allocation, Utilization (08)",
      totalMarks: 8,
      fields: [
        {
          name: "9.8.1",
          label: "Summary of budget and actual expenditure incurred at program level",
          marks: 4,
          hasTable: true,
          tableConfig: {
            title: "Table No. 9.8.1: Summary of budget and actual expenditure incurred at program level",
            columns: [
              { field: "total_budget", header: "Total Budget in CFYm1" },
              { field: "actual_expenditure", header: "Actual expenditure in CFYm1" },
              { field: "total_students", header: "Total No. of students in CFYm1" },
              { field: "expenditure_per_student", header: "Expenditure per student" }
            ],
            defaultRows: [
              { total_budget: "Demanded", actual_expenditure: "Actual Allocated", total_students: "Actual Expenditure", expenditure_per_student: "% Spent" }
            ]
          }
        },
        {
          name: "9.8.2",
          label: "Budget and actual expenditure incurred at program level",
          marks: 4,
          hasTable: true,
          tableConfig: {
            title: "Table No. 9.8.2: Budget and actual expenditure incurred at program level",
            columns: [
              { field: "items", header: "Items" },
              { field: "budgeted_cfy", header: "Budgeted in CFY" },
              { field: "actual_expenses_cfy", header: "Actual expenses in CFY (till ...)" },
              { field: "budgeted_cfym1", header: "Budgeted in CFYm1" },
              { field: "actual_expenses_cfym1", header: "Actual expenses in CFYm1" },
              { field: "budgeted_cfym2", header: "Budgeted in CFYm2" },
              { field: "actual_expenses_cfym2", header: "Actual Expenses in CFYm2" },
              { field: "budgeted_cfym3", header: "Budgeted in CFYm3" },
              { field: "actual_expenses_cfym3", header: "Actual Expenses in CFYm3" }
            ],
            defaultRows: [
              { items: "Laboratory equipment", budgeted_cfy: "", actual_expenses_cfy: "", budgeted_cfym1: "", actual_expenses_cfym1: "", budgeted_cfym2: "", actual_expenses_cfym2: "", budgeted_cfym3: "", actual_expenses_cfym3: "" },
              { items: "Software", budgeted_cfy: "", actual_expenses_cfy: "", budgeted_cfym1: "", actual_expenses_cfym1: "", budgeted_cfym2: "", actual_expenses_cfym2: "", budgeted_cfym3: "", actual_expenses_cfym3: "" },
              { items: "SDGs", budgeted_cfy: "", actual_expenses_cfy: "", budgeted_cfym1: "", actual_expenses_cfym1: "", budgeted_cfym2: "", actual_expenses_cfym2: "", budgeted_cfym3: "", actual_expenses_cfym3: "" },
              { items: "Support for faculty development", budgeted_cfy: "", actual_expenses_cfy: "", budgeted_cfym1: "", actual_expenses_cfym1: "", budgeted_cfym2: "", actual_expenses_cfym2: "", budgeted_cfym3: "", actual_expenses_cfym3: "" },
              { items: "R & D", budgeted_cfy: "", actual_expenses_cfy: "", budgeted_cfym1: "", actual_expenses_cfym1: "", budgeted_cfym2: "", actual_expenses_cfym2: "", budgeted_cfym3: "", actual_expenses_cfym3: "" },
              { items: "Industrial Training, Industry expert, Internship", budgeted_cfy: "", actual_expenses_cfy: "", budgeted_cfym1: "", actual_expenses_cfym1: "", budgeted_cfym2: "", actual_expenses_cfym2: "", budgeted_cfym3: "", actual_expenses_cfym3: "" },
              { items: "Miscellaneous expenses *", budgeted_cfy: "", actual_expenses_cfy: "", budgeted_cfym1: "", actual_expenses_cfym1: "", budgeted_cfym2: "", actual_expenses_cfym2: "", budgeted_cfym3: "", actual_expenses_cfym3: "" }
            ]
          }
        }
      ]
    },

    "9.9": {
      title: "9.9. Quality of Learning Resources (Hard/Soft) (05)",
      totalMarks: 5,
      fields: [
        { name: "9.9.1", label: "Provide details of available learning resources, including e-resources (books and journals), as well as information on the accessibility of these resources to students. Additionally, describe the support provided to students for self-learning activities.", marks: 5 }
      ]
    },

    "9.10": {
      title: "9.10. E-Governance (05)",
      totalMarks: 5,
      fields: [
        { name: "9.10.1", label: "E-governance initiatives, sustainable practices in academic and learning management, campus-wide computing resources, and their accessibility and availability to support academic and co-curricular activities for students and faculty.", marks: 5 }
      ]
    },

    "9.11": {
      title: "9.11. Initiatives and Implementation of Sustainable Development Goals (SDGs) (10)",
      totalMarks: 10,
      fields: [
        { name: "9.11.1", label: "Provide details of initiatives taken towards implementation of SDG specifically on green energy, waste management, recycling water, net zero, quality education, reuse, recycle, less use to renewables, etc. Provide evidences on implementation (projects assigned, R & D activities, entrepreneurial activities, outreach programs etc.)", marks: 10 }
      ]
    },

    "9.12": {
      title: "9.12. Innovative Educational Initiatives and Implementation (05)",
      totalMarks: 5,
      fields: [
        { name: "9.12.1", label: "Provide details of initiatives taken towards mobility of students, implementation of academic bank of credits, and support for holistic education including human values, multidisciplinary/interdisciplinary curriculum/programs, initiatives on Indian Knowledge System, Contribution towards and implementation of teaching in Indian language, etc. Policies on inclusivity and equity and their implementation, support for economically, socially and physically challenged students. Action plan and its implementation for slow learners.", marks: 5 }
      ]
    },

    "9.13": {
      title: "9.13. Faculty Performance Appraisal and Development System (FPADS) (10)",
      totalMarks: 10,
      fields: [
        { name: "9.13.1", label: "Faculty members of Higher Educational Institutions today have to perform a variety of tasks pertaining to diverse roles. In addition to instruction, faculty members need to innovate and conduct research for their self-renewal, keep abreast of changes in technology, and develop expertise for the effective implementation of curricula. They are also expected to provide services to the industry and community to understand and contribute to solving real-life problems in industry. Another role involves shouldering administrative responsibilities and cooperating with other faculty, heads of departments, and the head of the institute. An effective performance appraisal system for faculty is vital for optimizing the contribution of individual faculty to institutional performance.", marks: 10 }
      ]
    },

    "9.14": {
      title: "9.14. Outreach Activities (05)",
      totalMarks: 5,
      fields: [
        { name: "9.14.1", label: "Provide details of outreach activities such as community service, Unnat Bharat Abhiyan, social internship and society connect activities undertaken by the students and their achievements.", marks: 5 }
      ]
    }
  };

  const config = sectionConfig[section];

  useEffect(() => {
    const loadData = async () => {
      if (!nba_contributor_allocation_id || !section) {
        setInitialData({ content: {}, tableData: [], files: [] });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const methodName = `getCriteria${section.replace(".", "_")}_Data`;
        const apiMethod = nbaOptimizedAPIService[methodName];

        if (!apiMethod) {
          console.warn(`API method ${methodName} not found`);
          setInitialData({ content: {}, tableData: [], files: [] });
          return;
        }

        const response = await apiMethod(
          nba_accredited_program_id,
          nba_criteria_sub_level2_id,
          nba_contributor_allocation_id
        );

        setInitialData({
          content: response?.content || {},
          tableData: Array.isArray(response?.tableData) ? response.tableData : [],
          files: Array.isArray(response?.files)
            ? response.files.map((f, i) => ({ ...f, id: f.id || `file-${i}` }))
            : []
        });
      } catch (err) {
        console.error("Load failed:", err);
        toast.error("Failed to load saved data");
        setInitialData({ content: {}, tableData: [], files: [] });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [section, nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id]);

  const handleSave = async (data) => {
    if (!isContributorEditable) {
      toast.error("You don't have permission to edit");
      return;
    }

    setSaveLoading(true);
    try {
      const methodName = `saveCriteria${section.replace(".", "_")}_Data`;
      const apiMethod = nbaOptimizedAPIService[methodName];
      if (!apiMethod) throw new Error(`Save method not found: ${methodName}`);

      const payload = {
        content: data.content,
        tableData: data.tableData || [],
        files: data.files.map(f => ({
          description: f.description,
          filename: f.filename,
          url: f.url || "",
        })),
      };

      await apiMethod(
        nba_accredited_program_id,
        nba_criteria_sub_level2_id,
        nba_contributor_allocation_id,
        payload,
        data.files.filter(f => f.file)
      );

      toast.success("Section saved successfully!");

      const refreshed = await nbaOptimizedAPIService[methodName.replace("save", "get")](
        nba_accredited_program_id,
        nba_criteria_sub_level2_id,
        nba_contributor_allocation_id
      );

      setInitialData({
        content: refreshed?.content || {},
        tableData: Array.isArray(refreshed?.tableData) ? refreshed.tableData : [],
        files: Array.isArray(refreshed?.files)
          ? refreshed.files.map((f, i) => ({ ...f, id: f.id || `file-${i}` }))
          : []
      });
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.message || "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  };

  if (!config) {
    return <div className="p-12 text-center text-red-600 text-2xl font-bold bg-red-50 rounded-xl">Section {section} not configured</div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">Loading {config.title}...</div>;
  }

  return (
    <GenericCriteriaForm
      title={config.title}
      marks={config.totalMarks}
      fields={config.fields || []}
      tableConfig={config.tableConfig || null}
      initialData={initialData}
      onSave={handleSave}
      isCompleted={completed}
      isContributorEditable={isContributorEditable}
      saving={saveLoading}
    />
  );
};

export default CriterionForm9;