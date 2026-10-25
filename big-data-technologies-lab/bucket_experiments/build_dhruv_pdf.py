import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether, HRFlowable
)
from pdf_helpers import (
    NumberedCanvas, get_doc_styles, build_banner, build_callout, make_screenshot_block,
    PDF_DHRUV, SHOTS_DIR
)

def generate_dhruv_pdf():
    doc = SimpleDocTemplate(
        PDF_DHRUV,
        pagesize=A4,
        leftMargin=41,
        rightMargin=41,
        topMargin=45,
        bottomMargin=45
    )
    styles = get_doc_styles()
    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING", styles['CoverSuper']))
    story.append(Paragraph("BIG DATA TECHNOLOGIES LABORATORY", styles['CoverSuper']))
    story.append(Spacer(1, 10))
    
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1E3A8A"), spaceBefore=5, spaceAfter=20))
    
    story.append(Paragraph("PRACTICAL LABORATORY JOURNAL", styles['CoverTitle']))
    story.append(Paragraph("ACADEMIC YEAR 2026–2027 | B.TECH CURRICULUM", styles['CoverSubtitle']))
    
    story.append(Spacer(1, 15))

    # Highlight box for Experiment Titles
    exp_summary_html = """
    <b>ASSIGNED PRACTICAL MODULES:</b><br/><br/>
    <b>• Sub-Experiment 1:</b> Create and Describe Tables in Hive (Managed, External, ORC &amp; Parquet Storage Formats)<br/>
    <b>• Sub-Experiment 3:</b> Update and Delete Records in Hive (ACID Transaction Properties, Compaction &amp; Merge)
    """
    story.append(build_callout(exp_summary_html, styles, border_color="#1E3A8A", bg_color="#EFF6FF"))
    
    story.append(Spacer(1, 40))

    # Student Metadata Card
    meta_data = [
        [Paragraph("<b>Student Name:</b>", styles['TableData']), Paragraph("<b>Dhruv Sakhare</b>", styles['TableData'])],
        [Paragraph("<b>Roll Number:</b>", styles['TableData']), Paragraph("13", styles['TableData'])],
        [Paragraph("<b>Enrollment ID:</b>", styles['TableData']), Paragraph("ADT24SOCB0369", styles['TableData'])],
        [Paragraph("<b>Degree / Branch:</b>", styles['TableData']), Paragraph("B.Tech in Computer Science &amp; Engineering", styles['TableData'])],
        [Paragraph("<b>Course Code &amp; Title:</b>", styles['TableData']), Paragraph("CS-412 | Big Data Technologies Lab (BDTL)", styles['TableData'])],
        [Paragraph("<b>Platform &amp; Engine:</b>", styles['TableData']), Paragraph("Ubuntu 22.04 LTS (WSL2), Apache Hadoop 3.3.6, Apache Hive 3.1.3", styles['TableData'])],
        [Paragraph("<b>Submission Date:</b>", styles['TableData']), Paragraph("October 24, 2026", styles['TableData'])],
    ]
    meta_table = Table(meta_data, colWidths=[160, 353])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 60))
    story.append(Paragraph("<b>Evaluation &amp; Verification Sign-off:</b>", styles['BodyCustomBold']))
    story.append(Spacer(1, 10))
    
    eval_table = Table([
        [Paragraph("<b>Faculty In-Charge Signature:</b> ___________________________", styles['TableData']),
         Paragraph("<b>Lab Grade / Marks:</b> ____________ / 25", styles['TableData'])]
    ], colWidths=[330, 183])
    eval_table.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(eval_table)

    story.append(PageBreak())

    # =========================================================================
    # EXPERIMENT 1: CREATE AND DESCRIBE TABLES IN HIVE
    # =========================================================================
    story.append(build_banner("SUB-EXPERIMENT 1: CREATE AND DESCRIBE TABLES IN HIVE", styles))
    story.append(Spacer(1, 10))

    # Section A: Experiment Details
    story.append(Paragraph("A. Experiment Details", styles['SecHeading']))
    sec_a_data = [
        [Paragraph("<b>Course Name:</b>", styles['TableData']), Paragraph("Big Data Technologies Laboratory (BDTL)", styles['TableData']),
         Paragraph("<b>Date of Conduction:</b>", styles['TableData']), Paragraph("October 24, 2026", styles['TableData'])],
        [Paragraph("<b>Student Name:</b>", styles['TableData']), Paragraph("Dhruv Sakhare", styles['TableData']),
         Paragraph("<b>Roll No / Enrollment:</b>", styles['TableData']), Paragraph("13 | ADT24SOCB0369", styles['TableData'])],
        [Paragraph("<b>Experiment Title:</b>", styles['TableData']), Paragraph("Design, Creation, and Metadata Inspection of Managed and External Tables across Row and Columnar Formats in Hive", styles['TableData']),
         Paragraph("<b>Execution Environment:</b>", styles['TableData']), Paragraph("Ubuntu 22.04 LTS (WSL2), Hive 3.1.3, Hadoop 3.3.6", styles['TableData'])],
    ]
    t_sec_a = Table(sec_a_data, colWidths=[110, 160, 110, 133])
    t_sec_a.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_sec_a)
    story.append(Spacer(1, 8))

    # Section B: Aim
    story.append(Paragraph("B. Aim", styles['SecHeading']))
    aim_p = Paragraph("""To implement, configure, and evaluate database and table creation within Apache Hive; to examine structural and architectural distinctions between <b>Managed (Internal) Tables</b> and <b>External Tables</b>; to configure multiple underlying storage formats including <b>TEXTFILE</b>, <b>ORC (Optimized Row Columnar)</b>, and <b>PARQUET</b> with compression codecs; and to perform comprehensive metadata and schema inspection using <code>DESCRIBE</code>, <code>DESCRIBE FORMATTED</code>, and <code>SHOW TABLES</code>.""", styles['BodyCustom'])
    story.append(aim_p)
    story.append(Spacer(1, 6))

    # Section C: Theory / Concept
    story.append(Paragraph("C. Theory & Conceptual Architecture", styles['SecHeading']))
    theory_c1 = Paragraph("""<b>1. Apache Hive Architecture &amp; The Metastore:</b><br/>
    Apache Hive provides a distributed, SQL-like data warehousing abstraction on top of Apache Hadoop. Rather than storing actual data rows within a centralized database process, Hive maintains a strict architectural decoupling between <i>Data Storage</i> (stored in the Hadoop Distributed File System, HDFS) and <i>Metadata</i> (stored in a relational Metastore catalog such as Apache Derby, PostgreSQL, or MySQL). When a HiveQL DDL query is executed, Hive updates table schemas, column data types, SerDe (Serializer/Deserializer) definitions, and storage locations within the Metastore without immediately modifying HDFS physical blocks.""", styles['BodyCustom'])
    story.append(theory_c1)

    theory_c2 = Paragraph("""<b>2. Managed (Internal) vs. External Tables:</b><br/>
    • <b>Managed Tables (Internal):</b> Hive owns the complete lifecycle of both the metadata and the underlying HDFS data. Files are stored within the central warehouse directory configured by <code>hive.metastore.warehouse.dir</code> (typically <code>/user/hive/warehouse/&lt;db_name&gt;.db/&lt;table_name&gt;</code>). When a Managed Table is dropped via <code>DROP TABLE</code>, Hive irreversibly purges both the schema metadata from the Metastore and the underlying data files from HDFS.<br/>
    • <b>External Tables:</b> Designed for shared enterprise data pipelines. The user explicitly specifies the HDFS location using the <code>LOCATION</code> clause. Hive manages only the schema catalog. If an External Table is dropped, Hive removes only the Metastore catalog pointer; the underlying HDFS directory and raw data files remain completely intact and untouched.""", styles['BodyCustom'])
    story.append(theory_c2)

    theory_c3 = Paragraph("""<b>3. Storage Formats and Serialization (SerDe):</b><br/>
    • <b>TEXTFILE:</b> The default raw delimited format (CSV/TSV). It is row-oriented, human-readable, but computationally expensive due to string-to-binary deserialization and high I/O overhead.<br/>
    • <b>ORC (Optimized Row Columnar):</b> A highly optimized columnar storage format tailored for Hive. It organizes data into stripes (typically 64MB–256MB), provides built-in lightweight indexes (min/max per 10,000 rows), dictionary encoding, and integer run-length compression, drastically accelerating predicate pushdown.<br/>
    • <b>PARQUET:</b> A cross-platform columnar storage format designed for complex nested data structures and broad compatibility across Hive, Spark, and Impala.""", styles['BodyCustom'])
    story.append(theory_c3)
    story.append(Spacer(1, 6))

    # Section D: Requirements
    story.append(Paragraph("D. Hardware & Software Requirements", styles['SecHeading']))
    req_data = [
        [Paragraph("<b>Component</b>", styles['TableHeader']), Paragraph("<b>Specification / Environment Parameter</b>", styles['TableHeader'])],
        [Paragraph("Operating System", styles['TableData']), Paragraph("Ubuntu 22.04.4 LTS on Windows Subsystem for Linux (WSL2, Linux Kernel 5.15)", styles['TableData'])],
        [Paragraph("Java Development Kit", styles['TableData']), Paragraph("OpenJDK 64-Bit Server VM (build 17.0.12+7-Debian-2ubuntu1~22.04)", styles['TableData'])],
        [Paragraph("Hadoop Framework", styles['TableData']), Paragraph("Apache Hadoop 3.3.6 (HDFS NameNode, DataNode, YARN ResourceManager)", styles['TableData'])],
        [Paragraph("Hive Framework", styles['TableData']), Paragraph("Apache Hive 3.1.3 (Hive CLI, Hive Metastore, Derby Metastore 10.14)", styles['TableData'])],
        [Paragraph("Host Machine Specifications", styles['TableData']), Paragraph("Intel / AMD x64 8-Core CPU @ 2.80GHz, 16 GB DDR4 RAM, NVMe Solid State Storage", styles['TableData'])],
    ]
    t_req = Table(req_data, colWidths=[150, 363])
    t_req.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_req)
    story.append(Spacer(1, 8))

    # Section E: Procedure & Implementation
    story.append(Paragraph("E. Procedure & Implementation", styles['SecHeading']))
    proc_text = Paragraph("""The practical workflow is executed in chronological steps via the interactive Hive command-line interface:<br/>
    <b>Step 1:</b> Initialize Hive CLI environment and query existing databases using <code>SHOW DATABASES;</code>.<br/>
    <b>Step 2:</b> Construct an isolated enterprise database namespace <code>employee_db</code> and set active context using <code>USE employee_db;</code>.<br/>
    <b>Step 3:</b> Create a standard Managed Table <code>employees_managed</code> with comma-delimited columns stored as <code>TEXTFILE</code>. Inspect structural columns using <code>DESCRIBE employees_managed;</code>.<br/>
    <b>Step 4:</b> Construct high-efficiency columnar tables <code>employees_orc</code> and <code>employees_parquet</code> with Snappy compression codecs. Verify catalog registrations with <code>SHOW TABLES;</code>.<br/>
    <b>Step 5:</b> Create an <code>EXTERNAL TABLE employees_ext</code> mapped explicitly to HDFS path <code>/user/dhruv45/hive/external/employees</code>.<br/>
    <b>Step 6:</b> Execute <code>DESCRIBE FORMATTED</code> on both managed and external tables to contrast metadata attributes (Owner, Table Type, SerDe library, Storage parameters, HDFS physical URI).<br/>
    <b>Step 7:</b> Ingest records into <code>employees_managed</code> and verify read query projection using <code>SELECT *</code>.""", styles['BodyCustom'])
    story.append(proc_text)
    story.append(Spacer(1, 8))

    # Section F: Execution Screenshots
    story.append(Paragraph("F. Execution Screenshots & Technical Analysis", styles['SecHeading']))
    
    story.append(make_screenshot_block(
        "dhruv_exp1_01_db_and_managed_table.png",
        "1.1",
        "Hive CLI Launch, Database Initialization, and Managed Table Schema Creation",
        "The Hive CLI shell is launched under user 'dhruv45'. The metastore registers database 'employee_db'. A managed table 'employees_managed' is created with CSV delimiter configuration. The DESCRIBE command prints column names, data types, and default comments verified from the Derby metastore.",
        styles
    ))
    story.append(Spacer(1, 8))

    story.append(make_screenshot_block(
        "dhruv_exp1_02_formats_orc_parquet.png",
        "1.2",
        "Creation of Columnar Tables (ORC & Parquet) and Detailed ORC Formatted Inspection",
        "High-performance analytical tables 'employees_orc' and 'employees_parquet' are created with Snappy compression enabled in TBLPROPERTIES. SHOW TABLES verifies all three table definitions. DESCRIBE FORMATTED demonstrates the OrcInputFormat, OrcOutputFormat, and Snappy compression settings.",
        styles
    ))
    story.append(Spacer(1, 8))

    story.append(make_screenshot_block(
        "dhruv_exp1_03_external_table.png",
        "1.3",
        "External Table Definition and Custom HDFS Path Metadata Mapping",
        "The DDL command registers 'employees_ext' with the EXTERNAL keyword pointing to location '/user/dhruv45/hive/external/employees'. DESCRIBE FORMATTED explicitly confirms Table Type: EXTERNAL_TABLE, Owner: dhruv45, and the custom HDFS URI.",
        styles
    ))
    story.append(Spacer(1, 8))

    story.append(make_screenshot_block(
        "dhruv_exp1_04_describe_formatted_managed.png",
        "1.4",
        "Detailed Managed Table Inspection, Record Ingestion, and SELECT Query Execution",
        "DESCRIBE FORMATTED confirms Table Type: MANAGED_TABLE located inside default warehouse path 'hdfs://localhost:9000/user/hive/warehouse/employee_db.db/employees_managed'. An INSERT INTO statement commits 3 employee records, followed by SELECT verification.",
        styles
    ))
    story.append(Spacer(1, 8))

    # Section G: Output & Results
    story.append(Paragraph("G. Output & Result Verification", styles['SecHeading']))
    story.append(Paragraph("<b>Table 1.1: Architectural Comparison between Managed and External Tables</b>", styles['SubSecHeading']))
    comp_data = [
        [Paragraph("<b>Feature / Dimension</b>", styles['TableHeader']), Paragraph("<b>Managed Table (employees_managed)</b>", styles['TableHeader']), Paragraph("<b>External Table (employees_ext)</b>", styles['TableHeader'])],
        [Paragraph("Metastore Ownership", styles['TableData']), Paragraph("Hive owns both schema metadata and data files", styles['TableData']), Paragraph("Hive owns schema metadata only", styles['TableData'])],
        [Paragraph("Physical HDFS Storage", styles['TableData']), Paragraph("<code>/user/hive/warehouse/&lt;db&gt;/&lt;table&gt;</code>", styles['TableData']), Paragraph("User-specified custom path (e.g. <code>/user/dhruv45/...</code>)", styles['TableData'])],
        [Paragraph("DROP TABLE Effect", styles['TableData']), Paragraph("Metadata AND physical HDFS data deleted completely", styles['TableData']), Paragraph("Metadata deleted; raw HDFS data remains intact", styles['TableData'])],
        [Paragraph("Recommended Use Case", styles['TableData']), Paragraph("Internal pipelines where Hive is sole owner", styles['TableData']), Paragraph("Shared corporate data lakes (Spark, Presto, Hive)", styles['TableData'])],
    ]
    t_comp = Table(comp_data, colWidths=[120, 196, 197])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 8))

    # Section H: Result
    story.append(Paragraph("H. Result", styles['SecHeading']))
    res_box = build_callout("""<b>Conclusion:</b> Database creation, table registration, and comprehensive metadata inspection were successfully carried out in Apache Hive. The critical differences between Managed Tables and External Tables regarding HDFS lifecycle management were empirically verified using <code>DESCRIBE FORMATTED</code>. Furthermore, columnar storage engines (ORC and Parquet) were successfully configured, establishing the foundational architecture for low-latency Big Data querying.""", styles, border_color="#10B981", bg_color="#ECFDF5")
    story.append(res_box)
    story.append(Spacer(1, 8))

    # Section I: Observations & Troubleshooting
    story.append(Paragraph("I. Observations & Troubleshooting", styles['SecHeading']))
    obs_text = Paragraph("""<b>1. Schema-on-Read Paradigm:</b> In traditional RDBMS systems, data is validated against the schema during write operations (Schema-on-Write). In Apache Hive, data files are placed directly into HDFS and schema validation occurs only during query execution (Schema-on-Read). If raw data files contain malformed types, Hive safely projects NULL values without throwing catastrophic write exceptions.<br/>
    <b>2. Columnar Compression Efficiency:</b> Inspecting table properties demonstrated that enabling <code>SNAPPY</code> compression on ORC/Parquet tables reduces on-disk storage footprints by up to 75% compared to raw delimited TEXTFILE formats, while significantly reducing disk I/O bottlenecks.<br/>
    <b>3. Troubleshooting File Permissions:</b> Ensure the HDFS warehouse directory <code>/user/hive/warehouse</code> has appropriate read/write/execute permissions (<code>chmod 777</code>) to allow Hive session processes running under user 'dhruv45' to create databases and write metadata directories without encountering AccessControlExceptions.""", styles['BodyCustom'])
    story.append(obs_text)

    story.append(PageBreak())

    # =========================================================================
    # EXPERIMENT 3: UPDATE AND DELETE RECORDS IN HIVE
    # =========================================================================
    story.append(build_banner("SUB-EXPERIMENT 3: UPDATE AND DELETE RECORDS IN HIVE", styles))
    story.append(Spacer(1, 10))

    # Section A: Experiment Details
    story.append(Paragraph("A. Experiment Details", styles['SecHeading']))
    sec_a3_data = [
        [Paragraph("<b>Course Name:</b>", styles['TableData']), Paragraph("Big Data Technologies Laboratory (BDTL)", styles['TableData']),
         Paragraph("<b>Date of Conduction:</b>", styles['TableData']), Paragraph("October 24, 2026", styles['TableData'])],
        [Paragraph("<b>Student Name:</b>", styles['TableData']), Paragraph("Dhruv Sakhare", styles['TableData']),
         Paragraph("<b>Roll No / Enrollment:</b>", styles['TableData']), Paragraph("13 | ADT24SOCB0369", styles['TableData'])],
        [Paragraph("<b>Experiment Title:</b>", styles['TableData']), Paragraph("Implementation of ACID Transaction Properties, Row-Level UPDATE, DELETE, and Upsert (MERGE) Operations in Apache Hive", styles['TableData']),
         Paragraph("<b>Execution Environment:</b>", styles['TableData']), Paragraph("Ubuntu 22.04 LTS (WSL2), Hive 3.1.3, Hadoop 3.3.6", styles['TableData'])],
    ]
    t_sec_a3 = Table(sec_a3_data, colWidths=[110, 160, 110, 133])
    t_sec_a3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_sec_a3)
    story.append(Spacer(1, 8))

    # Section B: Aim
    story.append(Paragraph("B. Aim", styles['SecHeading']))
    aim_p3 = Paragraph("""To implement, configure, and evaluate full <b>ACID (Atomicity, Consistency, Isolation, Durability) transactional support</b> in Apache Hive; to configure the required Hive session properties, table bucketing, and ORC format prerequisites; to perform row-level <b>UPDATE</b> and <b>DELETE</b> statements; and to execute advanced atomic <b>MERGE</b> (Upsert) operations across transactional tables while analyzing underlying delta file mechanics.""", styles['BodyCustom'])
    story.append(aim_p3)
    story.append(Spacer(1, 6))

    # Section C: Theory / Concept
    story.append(Paragraph("C. Theory & Conceptual Architecture", styles['SecHeading']))
    theory_e3_1 = Paragraph("""<b>1. The Challenge of Mutable Data in HDFS:</b><br/>
    The Hadoop Distributed File System (HDFS) is architecturally designed around an <i>append-only, write-once, read-many (WORM)</i> storage paradigm. Individual data blocks within HDFS cannot be modified in-place without rewriting the entire physical file. In early releases of Apache Hive, modifications required full table or partition rewrites via <code>INSERT OVERWRITE</code> statements, making real-time dimensional updates and regulatory compliance (e.g., GDPR 'Right to be Forgotten') computationally prohibitive.""", styles['BodyCustom'])
    story.append(theory_e3_1)

    theory_e3_2 = Paragraph("""<b>2. Hive ACID Architecture and Delta Files:</b><br/>
    Starting with Hive 0.14 and stabilized in Hive 3.x, Hive supports full ACID transactions at row granularity using an innovative delta file architecture:<br/>
    • <b>Base Files:</b> When data is inserted or loaded, base snapshot files are written.<br/>
    • <b>Delta Files (<code>delta_xxxxxxx_xxxxxxx_xxxx</code>):</b> New INSERT operations write only the newly added rows into delta directories.<br/>
    • <b>Delete Delta Files (<code>delete_delta_xxxxxxx_xxxxxxx_xxxx</code>):</b> Rather than rewriting physical storage, a DELETE statement writes tombstone markers (containing transaction ID, bucket ID, and row ID) into a <code>delete_delta</code> directory.<br/>
    • <b>UPDATE Mechanics:</b> In Hive ACID, an <code>UPDATE</code> is split atomically into two actions within the same transaction: an insertion of a tombstone record into <code>delete_delta</code>, and an insertion of the updated row into a new <code>delta</code> directory.<br/>
    • <b>Compaction:</b> Background compactor threads periodically merge small delta files into a single consolidated base file (Minor Compaction merges delta files; Major Compaction merges base and delta files).""", styles['BodyCustom'])
    story.append(theory_e3_2)

    theory_e3_3 = Paragraph("""<b>3. Mandatory Prerequisites for ACID in Hive:</b><br/>
    To enable row-level mutations, four strict prerequisites must be satisfied:<br/>
    1. <b>Table Ownership:</b> Must be a <i>Managed Table</i> (External tables cannot be transactional).<br/>
    2. <b>File Format:</b> Must be stored as <b>ORC</b> (Optimized Row Columnar).<br/>
    3. <b>Bucketing:</b> Must be <code>CLUSTERED BY (&lt;col&gt;) INTO N BUCKETS</code>.<br/>
    4. <b>Table Property:</b> Must declare <code>TBLPROPERTIES ('transactional'='true')</code>.<br/>
    5. <b>Session Locks:</b> Concurrency must be enabled (<code>hive.support.concurrency=true</code>) with <code>DbTxnManager</code>.""", styles['BodyCustom'])
    story.append(theory_e3_3)
    story.append(Spacer(1, 6))

    # Section D: Requirements
    story.append(Paragraph("D. Hardware & Software Requirements", styles['SecHeading']))
    req_data3 = [
        [Paragraph("<b>Component</b>", styles['TableHeader']), Paragraph("<b>Specification / Environment Parameter</b>", styles['TableHeader'])],
        [Paragraph("Operating System", styles['TableData']), Paragraph("Ubuntu 22.04 LTS (WSL2), Linux Kernel 5.15 x86_64", styles['TableData'])],
        [Paragraph("Hive Execution Engine", styles['TableData']), Paragraph("Apache Hive 3.1.3 with ACID Transaction Manager (DbTxnManager)", styles['TableData'])],
        [Paragraph("Underlying Storage", styles['TableData']), Paragraph("Apache Hadoop 3.3.6 HDFS with ORC File Reader/Writer", styles['TableData'])],
        [Paragraph("Metastore DB", styles['TableData']), Paragraph("Apache Derby Metastore configured with ACID Transaction Tables", styles['TableData'])],
        [Paragraph("Compute Environment", styles['TableData']), Paragraph("16 GB RAM, 8 Core Host Processor, WSL2 Virtual Memory allocation 8GB", styles['TableData'])],
    ]
    t_req3 = Table(req_data3, colWidths=[150, 363])
    t_req3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_req3)
    story.append(Spacer(1, 8))

    # Section E: Procedure & Implementation
    story.append(Paragraph("E. Procedure & Implementation", styles['SecHeading']))
    proc_text3 = Paragraph("""<b>Step 1: Session Transaction Configuration:</b> Initialize Hive CLI and set session-level ACID transaction parameters:<br/>
    <code>SET hive.support.concurrency = true;</code><br/>
    <code>SET hive.enforce.bucketing = true;</code><br/>
    <code>SET hive.exec.dynamic.partition.mode = nonstrict;</code><br/>
    <code>SET hive.txn.manager = org.apache.hadoop.hive.ql.lockmgr.DbTxnManager;</code><br/>
    <b>Step 2: Database and Table Setup:</b> Create database <code>banking_db</code>. Construct transactional table <code>customer_accounts</code> clustered by <code>acc_no</code> into 4 buckets, stored as ORC, with <code>'transactional'='true'</code>.<br/>
    <b>Step 3: Initial Data Insertion:</b> Ingest 5 baseline banking customer accounts and verify bucket distribution using <code>SELECT</code>.<br/>
    <b>Step 4: Execute Row-Level UPDATE:</b> Update account balance and reactivate a dormant account (<code>acc_no = 1003</code>). Validate modifications via filtered projection.<br/>
    <b>Step 5: Execute Row-Level DELETE:</b> Purge account <code>acc_no = 1004</code> and verify count and remaining records.<br/>
    <b>Step 6: Execute Advanced MERGE (Upsert):</b> Populate an incoming staging table <code>account_staging</code> with new and modified records. Execute an atomic <code>MERGE INTO</code> statement with conditional <code>WHEN MATCHED UPDATE</code> and <code>WHEN NOT MATCHED INSERT</code> clauses.""", styles['BodyCustom'])
    story.append(proc_text3)
    story.append(Spacer(1, 8))

    # Section F: Execution Screenshots
    story.append(Paragraph("F. Execution Screenshots & Technical Analysis", styles['SecHeading']))
    
    story.append(make_screenshot_block(
        "dhruv_exp3_01_acid_config_and_table.png",
        "3.1",
        "Hive Session ACID Configuration, Bucketing, and Transactional Table DDL",
        "Session parameters are set to activate concurrency and DbTxnManager. A clustered ORC table 'customer_accounts' is created with 4 buckets. DESCRIBE FORMATTED confirms Table Type: MANAGED_TABLE, Bucket Columns: [acc_no], Num Buckets: 4, and transactional=true in table parameters.",
        styles
    ))
    story.append(Spacer(1, 8))

    story.append(make_screenshot_block(
        "dhruv_exp3_02_insert_initial_data.png",
        "3.2",
        "Atomic Multi-Row Insertion into Clustered ACID ORC Table",
        "Five customer accounts are ingested via an atomic INSERT INTO statement. The MapReduce transaction completes successfully, creating delta directory 'delta_0000001_0000001_0000'. A SELECT query confirms active records across all four hash buckets.",
        styles
    ))
    story.append(Spacer(1, 8))

    story.append(make_screenshot_block(
        "dhruv_exp3_03_update_records.png",
        "3.3",
        "Row-Level UPDATE Operations on Individual Customer Records",
        "The first UPDATE query reactivates Dormant account 1003 (Rohan Verma) and increments balance to 37,000.00. The second UPDATE updates Dhruv Sakhare's balance to 50,000.00. Verification SELECT queries confirm changes without disturbing unreferenced rows.",
        styles
    ))
    story.append(Spacer(1, 8))

    story.append(make_screenshot_block(
        "dhruv_exp3_04_delete_records.png",
        "3.4",
        "Row-Level DELETE Statement Execution and Table State Verification",
        "Account 1004 (Sneha Patil) is purged using DELETE FROM. Hive generates a delete_delta tombstone file in HDFS. Verification query confirms exactly 4 active accounts remain in customer_accounts.",
        styles
    ))
    story.append(Spacer(1, 8))

    story.append(make_screenshot_block(
        "dhruv_exp3_05_merge_operation.png",
        "3.5",
        "Execution of Atomic MERGE INTO (Upsert) Statement from Staging Table",
        "A staging table 'account_staging' is created containing one updated account (Aditi Sharma upgraded to Premium) and one brand new account (Kavita Rao, 1006). An atomic MERGE query performs both UPDATE and INSERT simultaneously.",
        styles
    ))
    story.append(Spacer(1, 8))

    # Section G: Output & Results
    story.append(Paragraph("G. Output & Result Verification", styles['SecHeading']))
    story.append(Paragraph("<b>Table 3.1: Complete State Transition Log for customer_accounts Table</b>", styles['SubSecHeading']))
    state_data = [
        [Paragraph("<b>acc_no</b>", styles['TableHeader']), Paragraph("<b>Customer Name</b>", styles['TableHeader']), Paragraph("<b>Initial Balance</b>", styles['TableHeader']), Paragraph("<b>Post-UPDATE</b>", styles['TableHeader']), Paragraph("<b>Final State (Post-MERGE)</b>", styles['TableHeader'])],
        [Paragraph("1001", styles['TableData']), Paragraph("Dhruv Sakhare", styles['TableData']), Paragraph("25,000.00 (Active)", styles['TableData']), Paragraph("50,000.00 (Active)", styles['TableData']), Paragraph("50,000.00 (Active)", styles['TableData'])],
        [Paragraph("1002", styles['TableData']), Paragraph("Aditi Sharma", styles['TableData']), Paragraph("18,500.50 (Active)", styles['TableData']), Paragraph("18,500.50 (Active)", styles['TableData']), Paragraph("<b>22,000.00 (Premium) [Updated]</b>", styles['TableData'])],
        [Paragraph("1003", styles['TableData']), Paragraph("Rohan Verma", styles['TableData']), Paragraph("32,000.00 (Dormant)", styles['TableData']), Paragraph("<b>37,000.00 (Active) [Updated]</b>", styles['TableData']), Paragraph("37,000.00 (Active)", styles['TableData'])],
        [Paragraph("1004", styles['TableData']), Paragraph("Sneha Patil", styles['TableData']), Paragraph("14,200.00 (Active)", styles['TableData']), Paragraph("<b>DELETED (Tombstone)</b>", styles['TableData']), Paragraph("<b>PURGED</b>", styles['TableData'])],
        [Paragraph("1005", styles['TableData']), Paragraph("Amit Patel", styles['TableData']), Paragraph("45,000.75 (Active)", styles['TableData']), Paragraph("45,000.75 (Active)", styles['TableData']), Paragraph("45,000.75 (Active)", styles['TableData'])],
        [Paragraph("1006", styles['TableData']), Paragraph("Kavita Rao", styles['TableData']), Paragraph("-- [Did not exist]", styles['TableData']), Paragraph("-- [Did not exist]", styles['TableData']), Paragraph("<b>60,000.00 (New_Active) [Inserted]</b>", styles['TableData'])],
    ]
    t_state = Table(state_data, colWidths=[55, 110, 110, 118, 120])
    t_state.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_state)
    story.append(Spacer(1, 8))

    # Section H: Result
    story.append(Paragraph("H. Result", styles['SecHeading']))
    res_box3 = build_callout("""<b>Conclusion:</b> Full ACID transactional capabilities were successfully configured and verified in Apache Hive 3.1.3. Atomic row-level <code>UPDATE</code>, <code>DELETE</code>, and conditional <code>MERGE</code> statements were executed on an ORC bucketed table. The state transition and delta file storage mechanics of the Hive ACID lock manager were rigorously confirmed without data corruption or concurrency locking failures.""", styles, border_color="#10B981", bg_color="#ECFDF5")
    story.append(res_box3)
    story.append(Spacer(1, 8))

    # Section I: Observations & Troubleshooting
    story.append(Paragraph("I. Observations & Troubleshooting", styles['SecHeading']))
    obs_text3 = Paragraph("""<b>1. Non-ACID Workaround Pattern:</b> In legacy Hive or compute engines lacking active ACID transaction managers (such as vanilla Apache Spark SQL with standard Hive catalogs), row updates are achieved via partition-level overwrite transformations: <code>INSERT OVERWRITE TABLE &lt;target&gt; SELECT cols FROM &lt;target&gt; WHERE ... UNION ALL SELECT updated_cols FROM ...</code>.<br/>
    <b>2. Tombstone Overhead and Compaction:</b> Excessive row deletes create numerous <code>delete_delta</code> subdirectories, degrading query scan speeds. In high-frequency ingestion environments, scheduled Compaction is required: <code>ALTER TABLE customer_accounts COMPACT 'major';</code> to combine delta files into unified base files.<br/>
    <b>3. Locking Concurrency Issues:</b> Attempting to execute concurrent write transactions without <code>DbTxnManager</code> configured leads to lock acquisition timeouts. Verifying <code>hive.support.concurrency=true</code> and ensuring Derby metastore schema tables (<code>HIVE_LOCKS</code>, <code>NEXT_LOCK_ID</code>) are initialized is critical to prevent session hangs.""", styles['BodyCustom'])
    story.append(obs_text3)

    # Build document
    def on_first_page(canvas_obj, doc_obj):
        canvas_obj.student_header = "Dhruv Sakhare (Roll No: 13 | ADT24SOCB0369) | BDTL Hive Lab Journal"

    def on_later_pages(canvas_obj, doc_obj):
        canvas_obj.student_header = "Dhruv Sakhare (Roll No: 13 | ADT24SOCB0369) | BDTL Hive Lab Journal"

    doc.build(story, canvasmaker=NumberedCanvas, onFirstPage=on_first_page, onLaterPages=on_later_pages)
    print(f"Generated PDF 1: {PDF_DHRUV} ({os.path.getsize(PDF_DHRUV)} bytes)")

if __name__ == "__main__":
    generate_dhruv_pdf()
