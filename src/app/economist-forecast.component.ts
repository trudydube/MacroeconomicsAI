import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { HttpClientModule } from "@angular/common/http";
import { NgIf, NgFor } from "@angular/common";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { KeycloakService } from "keycloak-angular";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { environment } from "./environments/environment";

@Component({
    selector: "app-forecast",
    templateUrl: "./economist-forecast.component.html",
    styleUrls: ["./economist-forecast.component.css"],
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [NgIf, HttpClientModule, NgFor],
    standalone: true,
})


export class EconomistForecastComponent {
  forecastOutput: any = null;
  variableDetails: string[] = [];
  additionalData: string[] = [];
  isLoading: boolean = false;
  selectedFile: File | null = null;
  selectedModel: File | null = null;
  datasets: any[] = [];
  models: any[] = [];
  defaultFilePath: string = "./Economic_Indicators.txt";

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {
    this.loadUserFiles();
  }

  public logout(): void {
      
    this.keycloakService.logout();
      
  }

  getUsername(): string {
    return this.keycloakService.getUsername();
  }

  loadUserFiles() {
    const username = this.getUsername();

    this.http.post<any>(`${environment.apiUrl}/src/app/get_files.php`, { username }).subscribe(response => {
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
        let yOffset = 0;
        while (yOffset < imgHeight) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, -yOffset, imgWidth, imgHeight);
          yOffset += 210;  
        }
      }
      const fileName = `${username}_forecastreport_${Date.now()}.pdf`; // Generates unique file name to avoid overwriting
      const pdfBlob = pdf.output("blob");
      const formData = new FormData();
      formData.append("pdfFile", pdfBlob, fileName);
      formData.append("username", username);

      this.http.post(`${environment.reportApiUrl}/save-pdf`, formData).subscribe(
        response => {
          console.log("PDF uploaded successfully", response);

        },
        error => {
          console.error("Error uploading PDF", error);
        }
      );
    
      pdf.save(fileName);
    });
  }

  uploadFile(file: File, fileType: string, username: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);
    formData.append("username", username);
  
    this.http.post(`${environment.apiUrl}/src/app/upload_file.php`, formData)
      .subscribe(response => {
        console.log(`${fileType} uploaded successfully`, response);
      }, error => {
        console.error(`Error uploading ${fileType}`, error);
      });
  }

  forecast() {
    const formData = new FormData();
    this.isLoading = true;
    const username = this.getUsername();


    if(this.selectedFile){
      formData.append("file", this.selectedFile);
      this.uploadFile(this.selectedFile, "dataset", username)

    } else {
      formData.append("default_file_path", this.defaultFilePath)
    }

    if (this.selectedModel) {
      formData.append("model", this.selectedModel);
      this.uploadFile(this.selectedModel, "model", username)
    }

    this.http.post<any>(`${environment.flask1ApiUrl}/forecast`, formData)
      .subscribe(response => {

        this.isLoading = false;

        if (response.success) {
            const lines = response.output.trim().split("\n");
            this.variableDetails = lines.slice(0,33)
            this.forecastOutput = lines.slice(34).filter((line: string) => line.trim() !== "").map((line: string) => {
                const columns = line.split("\t");
                return {
                    year: columns[0],
                    gdp: parseFloat(columns[1]),
                    unemploymentRate: parseFloat(columns[2]),
                    inflationRate: parseFloat(columns[3]),
                    economicGrowth: parseFloat(columns[4]),
                    quarterlyGrowth: parseFloat(columns[5]),
                    incomeDistribution: parseFloat(columns[6]),
                    netExports: parseFloat(columns[7]),
                };
            });

        } else {
          this.forecastOutput = "Error: " + response.error;
          this.isLoading = false;
        }
      });
  }
}