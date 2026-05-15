import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

     setTasks(response.data.schedule);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8">dayplan AI</h1>

      <div className="flex gap-4 mb-8">
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
            }
          }}
        />

        <button
          onClick={uploadFile}
          className="bg-blue-600 px-6 py-2 rounded-lg"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <div className="space-y-4">
        {tasks?.map((task, index) => (
          <div
            key={index}
            className="border border-gray-700 rounded-xl p-4"
          >
            <h2 className="text-xl font-semibold">{task.name}</h2>

            <div className="text-gray-400 mt-2">
              Priority: {task.priority}
            </div>

            <div className="text-gray-400">
              Type: {task.type}
            </div>

            <div className="text-gray-400">
              Deadline: {task.deadline}
            </div>

            <div className="text-gray-400">
              Fixed: {task.is_fixed ? "Yes" : "No"}
            </div>

            {task.fixed_time && (
              <div className="text-gray-400">
                Time: {task.fixed_time}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;