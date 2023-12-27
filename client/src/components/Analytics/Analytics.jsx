import "./Analytics.css";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";
import {
    selectCurrentBoardId,
    selectLocalBoards,
} from "../../features/boards/boardsSlice.js";
import { selectLocalColumns } from "../../features/columns/columnsSlice.js";
import { selectLocalTasks } from "../../features/tasks/tasksSlice.js";

const extractTaskData = (currentBoardId, columns, tasks) => {
    const data = [];

    // Filter columns for the current board
    const currentBoardColumns = columns.filter(
        (column) => column.boardId === currentBoardId
    );

    // Iterate through columns
    currentBoardColumns.forEach((column, index) => {
        // Filter tasks for the current column
        const columnTasks = tasks.filter((task) => task.columnId === column.id);

        // Add data to the array
        data.push({
            name: column.title,
            value: columnTasks.length,
        });
    });

    return data;
};

const TaskChart = () => {
    const currentBoardId = useSelector(selectCurrentBoardId);
    const localBoards = useSelector(selectLocalBoards);
    const localColumns = useSelector(selectLocalColumns);
    const localTasks = useSelector(selectLocalTasks);

    if (!currentBoardId) {
        return null;
    }

    const data = extractTaskData(currentBoardId, localColumns, localTasks);

    // const legendPayload = data.map((entry) => ({
    //     value: entry.name,
    //     type: "circle",
    //     color: entry.color,
    // }));

    return (
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie
                    dataKey="value"
                    data={data}
                    cx={"50%"}
                    cy={"50%"}
                    // innerRadius={"40%"}
                    outerRadius={"20%"}
                    fill="#8884d8"
                    label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        value,
                        index,
                    }) => {
                        const RADIAN = Math.PI / 180;
                        // eslint-disable-next-line
                        const radius =
                            25 + innerRadius + (outerRadius - innerRadius);
                        // eslint-disable-next-line
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        // eslint-disable-next-line
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                            <text
                                x={x}
                                y={y}
                                fill="#8884d8"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                            >
                                {data[index].name} ({value})
                            </text>
                        );
                    }}
                />
                {/* {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))} */}
                {/* </Pie> */}
                {/* <Tooltip /> */}
                {/* <Legend payload={legendPayload} /> */}
            </PieChart>
        </ResponsiveContainer>
    );
};

const Analytics = () => {
    return (
        <div className="analytics-container">
            <TaskChart />
        </div>
    );
};

export default Analytics;
