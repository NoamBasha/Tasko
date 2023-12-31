import "./BoardTasksChart.css";
import { Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useSelector } from "react-redux";
import {
    selectCurrentBoardId,
    selectLocalBoards,
} from "../../features/boards/boardsSlice.js";
import { selectLocalColumns } from "../../features/columns/columnsSlice.js";
import { selectLocalTasks } from "../../features/tasks/tasksSlice.js";

const columnColors = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF00FF",
    "#FFD700",
    "#7CFC00",
    "#FF4500",
    "#4169E1",
];

function extractTaskDataForCurrentBoard(currentBoardId, columns, tasks) {
    const data = [];

    const currentBoardColumns = columns.filter(
        (column) => column.boardId === currentBoardId
    );

    currentBoardColumns.forEach((column, index) => {
        const columnTasks = tasks.filter((task) => task.columnId === column.id);

        data.push({
            title: column.title,
            value: columnTasks.length,
            color: columnColors[index % columnColors.length],
        });
    });

    return data;
}

const BoardTasksChart = () => {
    const currentBoardId = useSelector(selectCurrentBoardId);

    const localBoards = useSelector(selectLocalBoards);
    const localColumns = useSelector(selectLocalColumns);
    const localTasks = useSelector(selectLocalTasks);

    if (!currentBoardId) {
        return null;
    }

    const currentBoardName = localBoards.find(
        (board) => board.id === currentBoardId
    )?.name;

    const data = extractTaskDataForCurrentBoard(
        currentBoardId,
        localColumns,
        localTasks
    );

    return (
        <div className="board-tasks-chart-container">
            <p className="board-tasks-chart-title">{currentBoardName}</p>
            <div className="board-tasks-chart-counts">
                <p>
                    Columns: <b>{localColumns.length}</b>
                </p>
                <p>
                    Tasks:<b> {localTasks.length}</b>
                </p>
            </div>
            <div className="board-tasks-chart-pie">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            isAnimationActive={false}
                            className="board-tasks-chart-pie-fill"
                            dataKey="value"
                            data={data}
                            cx={"50%"}
                            cy={"50%"}
                            innerRadius={"0%"}
                            outerRadius={"60%"}
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
                                const radius =
                                    25 +
                                    innerRadius +
                                    (outerRadius - innerRadius);
                                const x =
                                    cx + radius * Math.cos(-midAngle * RADIAN);
                                const y =
                                    cy + radius * Math.sin(-midAngle * RADIAN);

                                return (
                                    <text
                                        key={index}
                                        x={x}
                                        y={y}
                                        textAnchor={x > cx ? "start" : "end"}
                                        dominantBaseline="central"
                                        fontWeight={100}
                                    >
                                        {value}
                                    </text>
                                );
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name, props) => [
                                value,
                                props.payload.title,
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="board-tasks-chart-legend">
                {data.map((entry, index) => (
                    <div
                        key={`legend-item-${index}`}
                        style={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "10px",
                                height: "10px",
                                backgroundColor: entry.color,
                                marginRight: "5px",
                            }}
                        />
                        <span>{entry.title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BoardTasksChart;
