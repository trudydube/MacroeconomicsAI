import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { HttpClientModule } from "@angular/common/http";
import { NgIf, NgFor } from "@angular/common";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { KeycloakService } from "keycloak-angular";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
    selector: "app-scenario-analysis",
    templateUrl: "./scenario-analysis.component.html",
    styleUrls: ["./scenario-analysis.component.css"],
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [NgIf, HttpClientModule, NgFor, FormsModule],
    standalone: true,
})


export class ScenarioAnalysisComponent {
  latestVariables: any = null;
  shapValues: any[] = [];
  isLoading: boolean = false;
  rowHeaders: string[] = ["Govt Expenditure (% of GDP)", "Tax Revenue (% of GDP)", "Money Supply ($M)", "Interest Rate (%)", "Rate of Crawl (%)"];
  predictions: any = null;
  shapModel: boolean = true;
  selectedFile: File | null = null;
  selectedModel: File | null = null;
  apiUrl = 'http://localhost:3003';
  datasets: any[] = [];
  models: any[] = [];
  errorDetails: string[] = [];
  defaultFilePath: string = "C:/Users/trudy/OneDrive/Documents/CSI408/beta/aiapp/src/app/Economic_Indicators.txt";

  policyInputs = {
    govtExpenditure: 33.1,
    taxRevenue: 22.0,
    moneySupply: 8000,
    interestRate: 2.40,
    rateOfCrawl: -1.51,
  };


  constructor(private http: HttpClient, private keycloakService: KeycloakService) {
    this.loadUserFiles();
  }

  public logout(): void {
    
    this.keycloakService.logout();

  }

  getUsername(): string {
    return this.keycloakService.getUsername();
  }

  formValid() {
    return this.policyInputs.govtExpenditure >= 25 && this.policyInputs.govtExpenditure <= 55 &&
           this.policyInputs.taxRevenue >= 18 && this.policyInputs.taxRevenue <= 30 &&
           this.policyInputs.moneySupply >= 6000 && this.policyInputs.moneySupply <= 10000 &&
           this.policyInputs.interestRate >= 1 && this.policyInputs.interestRate <= 15 &&
           this.policyInputs.rateOfCrawl >= -5 && this.policyInputs.rateOfCrawl <= 5;
  }

  loadUserFiles() {
    const username = this.getUsername();

    this.http.post<any>("http://localhost:3000/src/app/get_files.php", { username }).subscribe(response => {
        this.datasets = response.datasets;
        this.models = response.models;
    }, error => {
        console.error("Error fetching files:", error);
    });
  }

  downloadFile(downloadUrl: string) {
    window.open(downloadUrl, "_blank");
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); 
    event.stopPropagation();
  }
  
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
  
      const fileEvent = { target: { files: [droppedFile] } } as unknown as Event;
      this.onFileSelected(fileEvent);
    }
  }

  onFileSelected(event: Event){
    const input = event.target as HTMLInputElement;
    if(input.files && input.files.length > 0){
      this.selectedFile = input.files[0];
    }
  }

  onModelDragOver(event: DragEvent) {
    event.preventDefault(); 
    event.stopPropagation();
  }
  
  onModelDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  onModelDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
  
      const fileEvent = { target: { files: [droppedFile] } } as unknown as Event;
      this.onModelFileSelected(fileEvent);
    }
  }

  onModelFileSelected(event: Event){
    const input = event.target as HTMLInputElement;
    if(input.files && input.files.length > 0){
      this.selectedModel = input.files[0];
    }
  }


  downloadPDF() {
    const username = this.getUsername();
    const element = document.querySelector('.policy-output') as HTMLElement;
    
    if (!element) {
      console.error("Element not found!");
      return;
    }
  
    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
  
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
      if (imgHeight > 210) {  
        let yOffset = 1;
        while (yOffset < imgHeight) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, -yOffset, imgWidth, imgHeight);
          yOffset += 210;  
        }
      }
      const fileName = `${username}_scenarioanalysisreport_${Date.now()}.pdf`; // Generates unique file name to avoid overwriting
      const path = "C:/Users/trudy/OneDrive/Documents/CSI408/beta/aiapp";
      const pdfBlob = pdf.output("blob");
      const formData = new FormData();
      formData.append("pdfFile", pdfBlob, fileName);

      this.http.post(`${this.apiUrl}/save-pdf`, formData).subscribe(
        response => {
          console.log("PDF uploaded successfully", response);

          const filePath = `${path}/public/${fileName}`;
          this.uploadReport(fileName, filePath, username);

        },
        error => {
          console.error("Error uploading PDF", error);
        }
      );
    
      pdf.save(fileName);
    });
  }

  uploadReport(fileName: string, filePath: string, username: string) {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("fileName", fileName);
    formData.append("filePath", filePath);

    this.http.post("http://localhost:3000/src/app/upload_report.php", formData)
        .subscribe(
            response => {
                console.log("Report file path saved successfully", response);
            },
            error => {
                console.error("Error saving report file path", error);
            }
        );

  }

  uploadFile(file: File, fileType: string, username: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);
    formData.append("username", username);
  
    this.http.post("http://localhost:3000/src/app/upload_file.php", formData)
      .subscribe(response => {
        console.log(`${fileType} uploaded successfully`, response);
      }, error => {
        console.error(`Error uploading ${fileType}`, error);
      });
  }

  generatePrediction() {
    const formData = new FormData();
    this.isLoading = true;
    const username = this.getUsername();

  
    if (
      !this.policyInputs.govtExpenditure || 
      !this.policyInputs.taxRevenue || 
      !this.policyInputs.moneySupply || 
      !this.policyInputs.interestRate || 
      !this.policyInputs.rateOfCrawl
    ) {
      alert("All fields must be filled before submitting!");
      return;
    }

    if(this.selectedFile){
      formData.append("dataset", this.selectedFile);
      this.uploadFile(this.selectedFile, "dataset", username)
    } else {
      formData.append("default_file_path", this.defaultFilePath)
    } 

    if (this.selectedModel) {
      this.shapModel = false;
      formData.append("model", this.selectedModel);
      this.uploadFile(this.selectedModel, "model", username)
    }


    this.http.post<any>("http://127.0.0.1:5004/scenario-analysis", this.policyInputs)
        .subscribe(response => {

          this.isLoading = false;
          
          if (response.success) {

            const error_lines = response.shap_output.trim().split("\n");
            this.errorDetails = error_lines.slice(0,8)

            const lines = response.scenario_output.trim().split("\n");

            const shapHeaders = lines[0].split("\t");
            this.shapValues = lines.slice(1, -22).filter((line: string) => line.trim() !== "").map((line: string) => {
              const values = line.split("\t").map(parseFloat);
              return {
                gdp: values[1],
                unemploymentRate: values[2],
                inflationRate: values[3],
                economicGrowth: values[4],
                quarterlyGrowth: values[5],
                incomeDistribution: values[6],
                netExports: values[7]
              };
            });

            this.latestVariables = {
                govtExpenditure: parseFloat(lines[lines.length - 19].split(": ")[1]),
                taxRevenue: parseFloat(lines[lines.length - 18].split(": ")[1]),
                moneySupply: parseFloat(lines[lines.length - 17].split(": ")[1]),
                interestRate: parseFloat(lines[lines.length - 16].split(": ")[1]),
                rateOfCrawl: parseFloat(lines[lines.length - 15].split(": ")[1]),
                gdp: parseFloat(lines[lines.length - 14].split(": ")[1]),
                unemploymentRate: parseFloat(lines[lines.length - 13].split(": ")[1]),
                inflationRate: parseFloat(lines[lines.length - 12].split(": ")[1]),
                economicGrowth: parseFloat(lines[lines.length - 11].split(": ")[1]),
                quarterlyGrowth: parseFloat(lines[lines.length - 10].split(": ")[1]),
                incomeDistribution: parseFloat(lines[lines.length - 9].split(": ")[1]),
                netExports: parseFloat(lines[lines.length - 8].split(": ")[1]),
              };

            this.predictions = {
              gdp: parseFloat(lines[lines.length - 7].split(": ")[1]),
              unemploymentRate: parseFloat(lines[lines.length - 6].split(": ")[1]),
              inflationRate: parseFloat(lines[lines.length - 5].split(": ")[1]),
              economicGrowth: parseFloat(lines[lines.length - 4].split(": ")[1]),
              quarterlyGrowth: parseFloat(lines[lines.length - 3].split(": ")[1]),
              incomeDistribution: parseFloat(lines[lines.length - 2].split(": ")[1]),
              netExports: parseFloat(lines[lines.length - 1].split(": ")[1]),
            }

           
          } else {
            this.shapValues = [];
            this.isLoading = false;
          }
        });

    }
  }
