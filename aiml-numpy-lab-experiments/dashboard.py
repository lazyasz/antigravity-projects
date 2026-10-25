import streamlit as st
import os
import subprocess
import pypdf
import matplotlib
import glob

# Set page configuration with a modern dark theme
st.set_page_config(
    page_title="AIML Lab - Experiment 5",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom premium styling using CSS
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
    
    /* Global styles */
    .stApp {
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        color: #f1f5f9;
        font-family: 'Outfit', sans-serif;
    }
    
    /* Sidebar styling */
    section[data-testid="stSidebar"] {
        background-color: #0b0f19 !important;
        border-right: 1px solid #1e293b;
    }
    
    /* Headers styling */
    h1, h2, h3 {
        font-family: 'Outfit', sans-serif;
        font-weight: 800;
        letter-spacing: -0.025em;
    }
    
    .main-title {
        font-size: 3rem;
        background: linear-gradient(to right, #38bdf8, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid rgba(255, 255, 255, 0.05);
    }
    
    .section-subtitle {
        color: #94a3b8;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
    
    /* Card component styling */
    .card {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    /* Code container styling */
    .code-container {
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 1rem;
        border: 1px solid #334155;
    }
    
    /* Button styles */
    .stButton>button {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 0.6rem 1.8rem;
        font-weight: 600;
        box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
        transition: all 0.2s ease-in-out;
    }
    
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(124, 58, 237, 0.6);
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border: none;
        color: white;
    }
    
    /* Console log styles */
    .console-header {
        background-color: #0f172a;
        color: #38bdf8;
        padding: 0.5rem 1rem;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.85rem;
        border-bottom: 1px solid #1e293b;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .console-body {
        background-color: #020617;
        color: #f1f5f9;
        font-family: 'JetBrains Mono', monospace;
        padding: 1rem;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        font-size: 0.9rem;
        white-space: pre-wrap;
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid #1e293b;
    }
    
    /* Highlight tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }

    .stTabs [data-baseweb="tab"] {
        background-color: rgba(30, 41, 59, 0.5);
        border: 1px solid #334155;
        border-radius: 6px;
        color: #94a3b8;
        padding: 0.5rem 1rem;
        font-weight: 600;
    }

    .stTabs [aria-selected="true"] {
        background-color: #4f46e5 !important;
        color: #ffffff !important;
        border-color: #4f46e5;
    }
</style>
""", unsafe_allow_html=True)

# Lab directory definition
LAB_DIR = os.path.dirname(os.path.abspath(__file__))
PDF_PATH = r"C:\Users\dhruv\Downloads\exp 5.pdf"

@st.cache_data
def get_pdf_slides(pdf_path):
    slides = []
    if not os.path.exists(pdf_path):
        return [(1, "PDF file 'exp 5.pdf' not found in Downloads folder.")]
    try:
        reader = pypdf.PdfReader(pdf_path)
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            slides.append((i + 1, text))
    except Exception as e:
        slides = [(1, f"Error reading PDF: {e}")]
    return slides

# Load slides and list files
slides = get_pdf_slides(PDF_PATH)
py_files = sorted(glob.glob(os.path.join(LAB_DIR, "[0-9][0-9]_*.py")))

# Sidebar Navigation
st.sidebar.markdown("<h2 style='color:#f1f5f9;margin-bottom:0;'>🤖 AIML Lab Dashboard</h2>", unsafe_allow_html=True)
st.sidebar.markdown("<p style='color:#94a3b8;font-size:0.85rem;margin-top:0;'>Experiment 5 - NumPy, Pandas, Matplotlib</p>", unsafe_allow_html=True)

st.sidebar.markdown("---")

app_mode = st.sidebar.radio(
    "Choose Dashboard Mode",
    ["💻 Interactive Code Studio", "📚 Slide Companion", "📝 Cheatsheet Guide"]
)

st.sidebar.markdown("---")
st.sidebar.markdown("### Workspace Info")
st.sidebar.info(f"📁 Path: `{LAB_DIR}`\n📄 Slides: `exp 5.pdf`")

# Helper function to run scripts
def run_code_in_subprocess(code_str):
    temp_script_path = os.path.join(LAB_DIR, "_temp_run.py")
    plot_path = os.path.join(LAB_DIR, "_temp_plot.png")
    
    if os.path.exists(plot_path):
        try:
            os.remove(plot_path)
        except Exception:
            pass
            
    # Inject code to use Agg backend and intercept show() to save figures
    modified_code = (
        "import os\n"
        "import matplotlib\n"
        "matplotlib.use('Agg')\n"
        "import matplotlib.pyplot as plt\n"
        "def custom_show(*args, **kwargs):\n"
        "    if plt.gcf().get_axes():\n"
        "        plt.gcf().savefig('_temp_plot.png', bbox_inches='tight', dpi=150)\n"
        "plt.show = custom_show\n\n"
    ) + code_str + (
        "\n\n# Fallback plot save if plt.show() was not called but axes exist\n"
        "if plt.gcf().get_axes() and not os.path.exists('_temp_plot.png'):\n"
        "    plt.gcf().savefig('_temp_plot.png', bbox_inches='tight', dpi=150)\n"
    )
    
    with open(temp_script_path, "w", encoding="utf-8") as f:
        f.write(modified_code)
        
    python_exe = r"C:\Users\dhruv\AppData\Local\Programs\Python\Python314\python.exe"
    
    result = subprocess.run(
        [python_exe, "_temp_run.py"],
        cwd=LAB_DIR,
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    
    if os.path.exists(temp_script_path):
        try:
            os.remove(temp_script_path)
        except Exception:
            pass
            
    has_plot = os.path.exists(plot_path)
    return result.stdout, result.stderr, has_plot, plot_path

# Mappings from slide numbers to script files for contextual links
slide_to_script_map = {
    3: "01_numpy_creation.py",
    4: "02_numpy_properties.py",
    5: "03_numpy_arithmetic.py",
    6: "04_numpy_slicing.py",
    7: "05_numpy_save_load.py",
    8: "06_pandas_series.py",
    9: "07_pandas_dataframe.py",
    10: "08_pandas_csv_io.py",
    11: "10_pandas_exploration.py",
    12: "08_pandas_csv_io.py",
    13: "11_pandas_diabetes_exploration.py",
    14: "12_pandas_missing_data.py",
    15: "13_pandas_dropna.py",
    16: "15_pandas_fillna.py",
    17: "16_pandas_rename.py",
    19: "17_plot_bar_simple.py",
    20: "18_plot_bar_grouped.py",
    21: "19_plot_line_simple.py",
    22: "20_plot_line_dotted.py",
    23: "21_plot_stack.py",
    24: "21_plot_stack.py",
    25: "22_plot_histogram.py",
    26: "23_plot_pie.py",
    27: "23_plot_pie.py",
    28: "24_plot_boxplot.py",
    29: "25_plot_scatter.py",
    30: "26_plot_scatter_grouped.py"
}

# --- MODE 1: INTERACTIVE CODE STUDIO ---
if app_mode == "💻 Interactive Code Studio":
    st.markdown("<h1 class='main-title'>💻 Interactive Code Studio</h1>", unsafe_allow_html=True)
    st.markdown("<p class='section-subtitle'>Browse, edit, and run NumPy, Pandas, and Plotting scripts dynamically.</p>", unsafe_allow_html=True)
    
    if not py_files:
        st.warning("No python script files found in the folder.")
    else:
        # Group scripts by library
        numpy_files = [f for f in py_files if "numpy" in os.path.basename(f)]
        pandas_files = [f for f in py_files if "pandas" in os.path.basename(f)]
        plot_files = [f for f in py_files if "plot" in os.path.basename(f)]
        
        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.markdown("### 📁 Select Lab Script")
            category = st.radio(
                "Filter by Category",
                ["NumPy (Arrays)", "Pandas (DataFrames)", "Matplotlib (Plotting)"]
            )
            
            if category == "NumPy (Arrays)":
                target_list = numpy_files
            elif category == "Pandas (DataFrames)":
                target_list = pandas_files
            else:
                target_list = plot_files
                
            file_names = [os.path.basename(f) for f in target_list]
            selected_name = st.selectbox("Select Script File", file_names)
            
            # Read script contents
            selected_file_path = os.path.join(LAB_DIR, selected_name)
            with open(selected_file_path, "r", encoding="utf-8") as f:
                code_content = f.read()
                
            st.markdown("---")
            st.markdown("### Code Operations")
            run_btn = st.button("🚀 Run Script")
            
        with col2:
            st.markdown(f"### 📝 Source Code Editor: `{selected_name}`")
            # Text area allows user to change the code before running
            edited_code = st.text_area(
                "You can edit this code directly in the browser:",
                code_content,
                height=300,
                key="code_editor"
            )
            
            if run_btn:
                with st.spinner("Executing script in Python environment..."):
                    stdout, stderr, has_plot, plot_file = run_code_in_subprocess(edited_code)
                    
                st.markdown("### 📟 Execution Terminal Output")
                
                # Console header
                st.markdown(f"""
                <div class='console-header'>
                    <span>bash - python {selected_name}</span>
                    <span style='color:#22c55e;'>● Running</span>
                </div>
                """, unsafe_allow_html=True)
                
                # Console body
                console_output = ""
                if stdout:
                    console_output += stdout
                if stderr:
                    console_output += f"\n[STDERR]\n{stderr}"
                if not stdout and not stderr:
                    console_output = "(No output printed to console)"
                    
                st.markdown(f"<div class='console-body'>{console_output}</div>", unsafe_allow_html=True)
                
                # Plot Display
                if has_plot:
                    st.markdown("---")
                    st.markdown("### 📊 Rendered Visualization")
                    st.image(plot_file, caption="Dynamically Generated Plot", use_container_width=True)
                    # Clean up
                    try:
                        os.remove(plot_file)
                    except Exception:
                        pass

# --- MODE 2: SLIDE COMPANION ---
elif app_mode == "📚 Slide Companion":
    st.markdown("<h1 class='main-title'>📚 Slide Companion</h1>", unsafe_allow_html=True)
    st.markdown("<p class='section-subtitle'>Interactive slide deck reader for Experiment 5 (NumPy, Pandas, Matplotlib, SciPy, Seaborn).</p>", unsafe_allow_html=True)
    
    if not slides or len(slides) == 1 and "not found" in slides[0][1]:
        st.error(f"Could not load PDF. Make sure **exp 5.pdf** is placed at: `{PDF_PATH}`")
    else:
        # Slide number slider
        num_slides = len(slides)
        slide_num = st.slider("Navigate Slides", 1, num_slides, 1)
        
        slide_idx, slide_text = slides[slide_num - 1]
        
        col1, col2 = st.columns([1, 1])
        
        with col1:
            st.markdown(f"### 📄 Slide {slide_num} / {num_slides}")
            # Render slide content inside a styled card
            st.markdown(f"""
            <div class='card' style='background-color:#0f172a; border-left:4px solid #4f46e5; min-height:350px;'>
                <h4 style='color:#38bdf8; margin-top:0;'>SLIDE CONTENT SUMMARY</h4>
                <div style='white-space:pre-wrap; font-size:1.05rem; line-height:1.6; color:#e2e8f0; font-family:"Outfit", sans-serif;'>
{slide_text.strip()}
                </div>
            </div>
            """, unsafe_allow_html=True)
            
        with col2:
            st.markdown("### ⚡ Live Code Link")
            # Suggest matching code to run for this slide
            matched_script = slide_to_script_map.get(slide_idx)
            if matched_script:
                st.success(f"💡 This slide corresponds to lab file: `{matched_script}`")
                
                # Read matching file contents
                matched_file_path = os.path.join(LAB_DIR, matched_script)
                if os.path.exists(matched_file_path):
                    with open(matched_file_path, "r", encoding="utf-8") as f:
                        file_code = f.read()
                        
                    st.code(file_code, language="python")
                    
                    if st.button("🚀 Quick Run This Script", key="quick_run"):
                        with st.spinner("Running script..."):
                            stdout, stderr, has_plot, plot_file = run_code_in_subprocess(file_code)
                            
                        # Terminal styling
                        st.markdown("<div class='console-header'><span>Output Terminal</span></div>", unsafe_allow_html=True)
                        st.markdown(f"<div class='console-body'>{stdout or '(No console output)'}</div>", unsafe_allow_html=True)
                        
                        if has_plot:
                            st.image(plot_file, caption="Rendered Plot", use_container_width=True)
                            try:
                                os.remove(plot_file)
                            except Exception:
                                pass
                else:
                    st.error(f"Script file `{matched_script}` not found in path.")
            else:
                st.info("This slide contains conceptual or introductory material. No specific script file is mapped to it.")

# --- MODE 3: CHEATSHEET GUIDE ---
elif app_mode == "📝 Cheatsheet Guide":
    st.markdown("<h1 class='main-title'>📝 Cheatsheet Guide</h1>", unsafe_allow_html=True)
    st.markdown("<p class='section-subtitle'>Quick-reference code cheat sheets for all lab libraries.</p>", unsafe_allow_html=True)
    
    tab1, tab2, tab3, tab4, tab5 = st.tabs(["NumPy", "Pandas", "Matplotlib", "SciPy", "Seaborn"])
    
    with tab1:
        st.markdown("""
        ### 🔢 NumPy Quick Reference
        NumPy is the core library for scientific computing in Python.
        
        #### Array Creation
        ```python
        import numpy as np
        
        a = np.array([1, 2, 3])                 # 1D array
        b = np.array([(1.5, 2, 3), (4, 5, 6)])  # 2D array
        np.zeros((3, 4))                        # Zero matrix (3x4)
        np.ones((2, 3))                         # Ones matrix (2x3)
        np.arange(10, 25, 5)                    # Start, Stop, Step array
        np.linspace(0, 2, 9)                    # Linearly spaced array
        np.eye(3)                               # Identity matrix (3x3)
        np.random.random((2, 2))                # Random float array
        ```
        
        #### Array Inspection
        ```python
        a.shape   # Dimensions
        len(a)    # Length
        a.ndim    # Number of dimensions
        a.size    # Number of elements
        a.dtype   # Element data type
        ```
        """)
        
    with tab2:
        st.markdown("""
        ### 🐼 Pandas Quick Reference
        Pandas provides high-performance data structures like Series and DataFrames.
        
        #### Creating Data Structures
        ```python
        import pandas as pd
        
        # Series
        s = pd.Series([3, -5, 7, 4], index=['a', 'b', 'c', 'd'])
        
        # DataFrame
        data = {
            'Country': ['Belgium', 'India', 'Brazil'],
            'Capital': ['Brussels', 'New Delhi', 'Brasília'],
            'Population': [11190846, 1303171035, 207847528]
        }
        df = pd.DataFrame(data)
        ```
        
        #### Reading & Writing Data
        ```python
        df = pd.read_csv('file.csv', header=None, nrows=5)
        df.to_csv('myDataFrame.csv')
        df = pd.read_excel('file.xlsx')
        ```
        
        #### Handling Missing Data
        ```python
        df.isnull().sum()            # Count nulls
        df.dropna()                  # Drop rows with nulls
        df.dropna(axis=1)            # Drop columns with nulls
        df.fillna(df.mean())         # Fill nulls with mean
        ```
        """)
        
    with tab3:
        st.markdown("""
        ### 📊 Matplotlib Quick Reference
        Matplotlib is the primary graph plotting library in Python.
        
        #### Standard Line Plot
        ```python
        import matplotlib.pyplot as plt
        
        x = [1, 2, 3, 4]
        y = [10, 20, 25, 30]
        plt.plot(x, y, color='blue', linestyle='dashed')
        plt.xlabel('X Axis')
        plt.ylabel('Y Axis')
        plt.title('Line Graph')
        plt.show()
        ```
        
        #### Bar Chart
        ```python
        plt.bar(['A', 'B', 'C'], [5, 12, 8])
        plt.show()
        ```
        
        #### Scatter Plot
        ```python
        plt.scatter(x_coords, y_coords)
        plt.show()
        ```
        """)
        
    with tab4:
        st.markdown("""
        ### 🔬 SciPy Quick Reference
        SciPy is used for scientific and technical computing.
        
        | Subpackage | Description |
        |---|---|
        | `scipy.integrate` | Integration and ODE solvers |
        | `scipy.linalg` | Linear algebra routines |
        | `scipy.optimize` | Optimization and root-finding |
        | `scipy.signal` | Signal processing |
        | `scipy.sparse` | Sparse matrices |
        | `scipy.stats` | Statistical distributions and functions |
        """)
        
    with tab5:
        st.markdown("""
        ### 🌊 Seaborn Quick Reference
        Seaborn is built on top of Matplotlib and provides a high-level drawing interface.
        
        ```python
        import seaborn as sns
        import matplotlib.pyplot as plt
        
        # Load sample dataset
        tips = sns.load_dataset("tips")
        
        # Draw scatter plot with linear regression line
        sns.lmplot(x="total_bill", y="tip", data=tips)
        plt.show()
        ```
        """)
